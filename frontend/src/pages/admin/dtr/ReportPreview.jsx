import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportPreview({
  onBack,
  dtrRows = [],
  employee,
  department,
  signatory,
}) {
  
  const [showPdfOptions, setShowPdfOptions] = useState(false);

  const tableHead = [
    ["Date", "Day", "AM IN", "AM OUT", "PM IN", "PM OUT", "OT IN", "OT OUT"],
  ];

  const tableData = dtrRows.map((row) => [
    row.date,
    row.day,
    row.amIn,
    row.amOut,
    row.pmIn,
    row.pmOut,
    row.otIn,
    row.otOut,
  ]);

  const parseDate = (value) => {
    if (!value) return null;

    const parts = String(value).trim().split(/[/-]/);
    if (parts.length !== 3) return null;

    const month = Number(parts[0]);
    const day = Number(parts[1]);
    let year = Number(parts[2]);

    if (!month || !day || !year) return null;

    if (year < 100) {
      year += 2000;
    }

    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const formatDateIso = (date) => {
    if (!date) return "-";

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const getDateRange = () => {
    const validDates = dtrRows
      .map((row) => parseDate(row.date))
      .filter(Boolean)
      .sort((a, b) => a - b);

    if (!validDates.length) {
      return {
        monthYear: "-",
        rangeText: "-",
      };
    }

    const first = validDates[0];
    const last = validDates[validDates.length - 1];

    return {
      monthYear: first.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      }),
      rangeText: `${formatDateIso(first)} - ${formatDateIso(last)}`,
    };
  };

  const formatDateForOneColumn = (value) => {
    const parsed = parseDate(value);
    if (!parsed) return value || "";

    return `${parsed.getMonth() + 1}/${parsed.getDate()}/${parsed.getFullYear()}`;
  };

  const formatTimeForOneColumn = (value) => {
    if (!value) return "";

    const text = String(value).trim();
    if (!text || text === "-" || text === "--") return "";

    const match = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([AP]M)?$/i);
    if (!match) return text;

    let hours = Number(match[1]);
    const minutes = match[2];
    const suffix = match[3]?.toUpperCase();

    if (suffix === "AM" && hours === 12) {
      hours = 0;
    } else if (suffix === "PM" && hours !== 12) {
      hours += 12;
    }

    const twelveHour = ((hours + 11) % 12) + 1;
    return `${twelveHour}:${minutes}`;
  };

  const drawPdfHeader = (doc) => {
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Monthly Daily Time Record", 105, 15, { align: "center" });

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text("For the Month of", 105, 22, { align: "center" });

    doc.setFontSize(10);
    doc.text(`Name: ${employee?.name || "-"}`, 14, 32);
    doc.text(`Office: ${department?.name || "-"}`, 150, 32);
  };

  const drawSignatory = (doc, y) => {
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");

    const signatoryName = signatory?.head_name || "-";

    doc.text(signatoryName, 150, y + 12);

    doc.setFont(undefined, "normal");
    doc.text("Signature over printed name", 150, y + 18);
  };

  const drawOneColumnHeader = (doc) => {
    const { monthYear, rangeText } = getDateRange();

    doc.setLineWidth(0.4);
    doc.line(18, 13, 192, 13);

    doc.setFont(undefined, "bold");
    doc.setFontSize(10);
    doc.text(
      `DAILY TIME RECORD OF - ${String(monthYear).toUpperCase()}`,
      105,
      18,
      {
        align: "center",
      },
    );

    doc.setLineWidth(0.25);
    doc.line(18, 20.2, 192, 20.2);

    doc.setFont(undefined, "normal");
    doc.setFontSize(8);
    doc.text(`Statistics Date: ${rangeText}`, 18, 23.1);
    doc.text(`Office: ${department?.name || "-"}`, 192, 23.1, { align: "right" });


    doc.setLineWidth(0.25);
    doc.line(18, 25.0, 192, 25.0);

    doc.text(`Name: ${employee?.name || "-"}`, 192, 28.0, { align: "right" });

    
    doc.line(18, 29.5, 192, 29.5);
  };


  const drawOneColumnSignatures = (doc, contentEndY) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    let signatureY = contentEndY + 12;

    if (signatureY > pageHeight - 30) {
      doc.addPage();
      signatureY = 40;
    }

    const leftStart = 26;
    const leftEnd = 86;
    const rightStart = 124;
    const rightEnd = 184;

    doc.setLineWidth(0.3);
    doc.line(leftStart, signatureY, leftEnd, signatureY);
    doc.line(rightStart, signatureY, rightEnd, signatureY);

    doc.setFontSize(8);
    doc.setFont(undefined, "bold");
    doc.text(employee?.name || "Employee", (leftStart + leftEnd) / 2, signatureY - 2, {
      align: "center",
    });

    const supervisorName = signatory?.head_name || "Supervisor";
    doc.text(supervisorName, (rightStart + rightEnd) / 2, signatureY - 2, {
      align: "center",
    });

    doc.setFont(undefined, "normal");
    doc.text("Employee Signature", (leftStart + leftEnd) / 2, signatureY + 5, {
      align: "center",
    });
    doc.text("Supervisor", (rightStart + rightEnd) / 2, signatureY + 5, {
      align: "center",
    });
  };

  //Export to XLSX
  const exportToXLSX = () => {
    const header = [
      ["Monthly Daily Time Record"],
      ["For the Month of"],
      [`Name: ${employee?.name || "-"}`],
      [`Office: ${department?.name || "-"}`],
      [],
    ];

    const tableHeader = [
      ["Date", "Day", "AM IN", "AM OUT", "PM IN", "PM OUT", "OT IN", "OT OUT"],
    ];

    const tableData = dtrRows.map((row) => [
      row.date,
      row.day,
      row.amIn,
      row.amOut,
      row.pmIn,
      row.pmOut,
      row.otIn,
      row.otOut,
    ]);

    const worksheetData = [...header, ...tableHeader, ...tableData];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "DTR");

    worksheet["!cols"] = [
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
    ];

    XLSX.writeFile(workbook, `${employee?.name || "DTR"}_Report.xlsx`);
  };

  //Export PDF
  const exportToPDF = (columnLayout = "1") => {
    try {
      const doc = new jsPDF();
      let finalY = 58;

      if (columnLayout === "2") {
        drawPdfHeader(doc);
        const pageWidth = doc.internal.pageSize.getWidth();
        const marginX = 14;
        const columnGap = 8;
        const columnWidth = (pageWidth - marginX * 2 - columnGap) / 2;
        const splitIndex = Math.ceil(tableData.length / 2);
        const leftRows = tableData.slice(0, splitIndex);
        const rightRows = tableData.slice(splitIndex);

        autoTable(doc, {
          startY: 38,
          head: tableHead,
          body: leftRows,
          margin: { left: marginX },
          tableWidth: columnWidth,
          styles: {
            fontSize: 6.2,
            cellPadding: 1,
            halign: "center",
            overflow: "linebreak",
          },
          headStyles: {
            fillColor: [240, 240, 240],
            textColor: 0,
            fontStyle: "bold",
          },
          columnStyles: {
            0: { halign: "left", cellWidth: 14 },
            1: { halign: "left", cellWidth: 11 },
            2: { cellWidth: 10 },
            3: { cellWidth: 10 },
            4: { cellWidth: 10 },
            5: { cellWidth: 10 },
            6: { cellWidth: 10 },
            7: { cellWidth: 10 },
          },
          theme: "grid",
        });

        const leftFinalY = doc.lastAutoTable?.finalY || 38;

        autoTable(doc, {
          startY: 38,
          head: tableHead,
          body: rightRows,
          margin: { left: marginX + columnWidth + columnGap },
          tableWidth: columnWidth,
          styles: {
            fontSize: 6.2,
            cellPadding: 1,
            halign: "center",
            overflow: "linebreak",
          },
          headStyles: {
            fillColor: [240, 240, 240],
            textColor: 0,
            fontStyle: "bold",
          },
          columnStyles: {
            0: { halign: "left", cellWidth: 14 },
            1: { halign: "left", cellWidth: 11 },
            2: { cellWidth: 10 },
            3: { cellWidth: 10 },
            4: { cellWidth: 10 },
            5: { cellWidth: 10 },
            6: { cellWidth: 10 },
            7: { cellWidth: 10 },
          },
          theme: "grid",
        });

        const rightFinalY = doc.lastAutoTable?.finalY || 38;
        finalY = Math.max(leftFinalY, rightFinalY) + 8;
        drawSignatory(doc, finalY);
      } else {
        const oneColumnHead = [["Date", "AM IN", "AM OUT", "PM IN", "PM OUT"]];
        const oneColumnBody = dtrRows.map((row) => [
          formatDateForOneColumn(row.date),
          formatTimeForOneColumn(row.amIn),
          formatTimeForOneColumn(row.amOut),
          formatTimeForOneColumn(row.pmIn),
          formatTimeForOneColumn(row.pmOut),
        ]);

        drawOneColumnHeader(doc);

        const tableWidth = 102;
        const marginLeft = 18;

        autoTable(doc, {
          // Keep 1cm (10mm) space below the header block.
          startY: 39.5,
          head: oneColumnHead,
          body: oneColumnBody,
          margin: { left: marginLeft },
          tableWidth,
          styles: {
            fontSize: 7,
            cellPadding: 1.2,
            halign: "center",
            lineWidth: 0,
            lineColor: 0,
          },
          headStyles: {
            fillColor: [255, 255, 255],
            textColor: 0,
            fontStyle: "bold",
            lineWidth: 0,
            lineColor: 0,
          },
          bodyStyles: {
            lineWidth: 0,
            lineColor: 0,
          },
          columnStyles: {
            0: { halign: "left", cellWidth: 24 },
            1: { cellWidth: 19.5 },
            2: { cellWidth: 19.5 },
            3: { cellWidth: 19.5 },
            4: { cellWidth: 19.5 },
          },
          theme: "plain",
          didDrawCell: (data) => {
            if (
              (data.section === "head" || data.section === "body") &&
              data.column.index === data.table.columns.length - 1
            ) {
              const y = data.cell.y + data.cell.height;
              const x1 = marginLeft;
              const x2 = marginLeft + tableWidth;

              doc.setLineWidth(0.2);
              doc.line(x1, y, x2, y);
            }
          },
        });

        finalY = doc.lastAutoTable?.finalY || 38;
        drawOneColumnSignatures(doc, finalY);
      }

      doc.save(`${employee?.name || "DTR"}_Report.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
    }
  };

  const handleExportPDF = (columnLayout) => {
    setShowPdfOptions(false);
    exportToPDF(columnLayout);
  };

  return (
    <div>
      {/* Report Card */}
      <div className="bg-white rounded-xl shadow p-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-3">
          <div className="flex items-center gap-2">
            <button
              className="text-gray-500 hover:text-blue-900 p-1 rounded-full"
              onClick={onBack}
            >
              <ChevronLeft size={22} />
            </button>
            <span className="font-semibold text-lg">Report Preview</span>
            <span className="ml-2 text-xs text-gray-400">OMA1</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportToXLSX}
              className="border border-green-600 text-green-600 px-4 py-1 rounded hover:bg-green-50 text-sm font-medium"
            >
              Export XLSX
            </button>
            <div className="relative">
              <button
                onClick={() => setShowPdfOptions((prev) => !prev)}
                className="border border-gray-400 text-gray-700 px-4 py-1 rounded hover:bg-gray-100 text-sm font-medium"
              >
                Export PDF
              </button>

              {showPdfOptions && (
                <div className="absolute right-0 mt-2 w-44 rounded-lg border border-gray-200 bg-white shadow-lg z-20 p-2">
                  <p className="text-[11px] text-gray-500 mb-2 px-1">Choose layout</p>
                  <button
                    onClick={() => handleExportPDF("1")}
                    className="w-full text-left text-sm px-3 py-2 rounded hover:bg-gray-100"
                  >
                    1 Column
                  </button>
                  <button
                    onClick={() => handleExportPDF("2")}
                    className="w-full text-left text-sm px-3 py-2 rounded hover:bg-gray-100"
                  >
                    2 Columns
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Report Info */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex-1">
            <div className="text-center">
              <div className="text-sm font-medium">
                Monthly Daily Time Record
              </div>
              <div className="text-xs text-gray-500">
                For the Month of MARCH 2026
              </div>
            </div>
            <div className="text-xs mt-2">
              Name:{" "}
              <span className="font-semibold">{employee?.name || "—"}</span>
            </div>
          </div>
          <div className="text-xs">
            Office:{" "}
            <span className="font-semibold">{department?.name || "—"}</span>
          </div>
        </div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border-separate border-spacing-0 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gray-100 text-gray-700 font-semibold">
                <th className="px-4 py-2 text-left rounded-tl-lg">Date</th>
                <th className="px-4 py-2 text-left">Day</th>
                <th className="px-4 py-2 text-left">AM IN</th>
                <th className="px-4 py-2 text-left">AM OUT</th>
                <th className="px-4 py-2 text-left">PM IN</th>
                <th className="px-4 py-2 text-left">PM OUT</th>
                <th className="px-4 py-2 text-left">OT IN</th>
                <th className="px-4 py-2 text-left rounded-tr-lg">OT OUT</th>
              </tr>
            </thead>
            <tbody>
              {dtrRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2 border-t border-gray-200 text-left font-medium text-gray-700">
                    {row.date}
                  </td>
                  <td className="px-4 py-2 border-t border-gray-200 text-left">
                    {row.day}
                  </td>
                  <td className="px-4 py-2 border-t border-gray-200 text-left">
                    {row.amIn}
                  </td>
                  <td className="px-4 py-2 border-t border-gray-200 text-left">
                    {row.amOut}
                  </td>
                  <td className="px-4 py-2 border-t border-gray-200 text-left">
                    {row.pmIn}
                  </td>
                  <td className="px-4 py-2 border-t border-gray-200 text-left">
                    {row.pmOut}
                  </td>
                  <td className="px-4 py-2 border-t border-gray-200 text-left">
                    {row.otIn}
                  </td>
                  <td className="px-4 py-2 border-t border-gray-200 text-left">
                    {row.otOut}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
