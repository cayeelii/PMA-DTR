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

  // Use the same full calendar  
  const reportRows = dtrRows;

  const tableData = reportRows.map((row) => [
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
    const validDates = reportRows
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
    doc.text(`Statistics Date: ${rangeText}`, 19.2, 23.1);
    doc.text(`Office: ${department?.name || "-"}`, 192, 23.1, {
      align: "right",
    });

    doc.setLineWidth(0.25);
    doc.line(18, 25.0, 192, 25.0);

    doc.text(`Name: ${employee?.name || "-"}`, 19.2, 28.0);

    doc.line(18, 29.5, 192, 29.5);
  };

  const drawOneColumnSignatures = (doc, contentEndY) => {
    let signatureY = contentEndY + 32; 

    if (signatureY > doc.internal.pageSize.getHeight() - 30) {
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
    doc.text(
      employee?.name || "Employee",
      (leftStart + leftEnd) / 2,
      signatureY - 2,
      {
        align: "center",
      },
    );

    const supervisorName = signatory
      ? `${signatory.position || ""} ${signatory.head_name || ""}`.trim()
      : "";

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
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();

      // Helper to strip seconds and AM/PM (e.g., "08:30:00 AM" -> "08:30")
      const formatTimeShort = (timeStr) => {
        if (!timeStr || timeStr === "-" || timeStr === "--") return "";
        const parts = timeStr.split(":");
        if (parts.length < 2) return timeStr;
        return `${parts[0]}:${parts[1].split(" ")[0]}`;
      };

      // Helper function to draw a single DTR slip
      const drawDTRForm = (startX, width) => {
        // Reduced horizontal margins to allow text to enlarge
        const margin = 6; 
        const centerX = startX + width / 2;
        const contentWidth = width - margin * 2;

        // --- 1. Header Section ---
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11); // Enlarged
        doc.text("Monthly Daily Time Record", centerX, 12, { align: "center" });

        doc.setFontSize(10);
        const { monthYear } = getDateRange();
        doc.text(`For the Month of ${monthYear.toUpperCase()}`, centerX, 18, { align: "center" });

        // --- 2. Identity Section ---
        doc.setLineWidth(0.1);
        doc.line(startX + margin, 21, startX + width - margin, 21);
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10); // Enlarged
        doc.text(`Name: ${employee?.name?.toUpperCase() || "-"}`, startX + margin, 26);
        doc.text(`Dept / Office: ${department?.name || "-"}`, startX + margin, 31);

        doc.line(startX + margin, 33, startX + width - margin, 33);

        // --- 3. Table Header ---
        const tableHeader = [
          [
            { content: "No / Day", rowSpan: 2, styles: { valign: "middle", halign: "left" } },
            { content: "AM", colSpan: 2 },
            { content: "PM", colSpan: 2 },
            { content: "OT", colSpan: 2 },
          ],
          ["IN", "OUT", "IN", "OUT", "IN", "OUT"],
        ];

        // --- 4. Data Generation (31 rows) ---
        const rows = [];
        const daysArr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        for (let i = 1; i <= 31; i++) {
          const dayNum = String(i).padStart(2, "0");
          const record = dtrRows.find((r) => {
            const d = parseDate(r.date);
            return d && d.getDate() === i;
          });

          let dayName = record?.day || "";
          if (!dayName && dtrRows.length > 0) {
            const firstDate = parseDate(dtrRows[0].date);
            if (firstDate) {
              const d = new Date(firstDate.getFullYear(), firstDate.getMonth(), i);
              dayName = daysArr[d.getDay()];
            }
          }

          rows.push([
            `${dayNum} ${dayName}`,
            formatTimeShort(record?.amIn),
            formatTimeShort(record?.amOut),
            formatTimeShort(record?.pmIn),
            formatTimeShort(record?.pmOut),
            formatTimeShort(record?.otIn),
            formatTimeShort(record?.otOut),
          ]);
        }

        autoTable(doc, {
          startY: 33,
          head: tableHeader,
          body: rows,
          margin: { left: startX + margin },
          tableWidth: contentWidth,
          theme: "plain",
          styles: {
            fontSize: 7.5, 
            cellPadding: 0.8, 
            halign: "center",
            textColor: [0, 0, 0],
            font: "helvetica",
          },
          headStyles: {
            fillColor: [255, 255, 255],
            fontStyle: "bold",
          },
          columnStyles: {
            0: { halign: "left", cellWidth: 16 },
          },
          didDrawCell: (data) => {
            doc.setLineWidth(0.1);
            doc.line(
              data.cell.x,
              data.cell.y + data.cell.height,
              data.cell.x + data.cell.width,
              data.cell.y + data.cell.height
            );
          },
        });

        // --- 5. Footer / Signature Section ---
        const finalTableY = doc.lastAutoTable.finalY;
        const footerY = finalTableY + 12;

        doc.line(startX + margin + 5, footerY, startX + width - margin - 5, footerY);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.text("EMPLOYEE SIGNATURE", centerX, footerY + 5, { align: "center" });

        const sigY = footerY + 18; 
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10); 
        const bossName = signatory?.head_name?.toUpperCase() || "CAPT JOHN RONALD A MANGAHAS PN(GSC)";
        doc.text(bossName, centerX, sigY, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8); 
        const bossPos = signatory?.position || "AC of S for Plans and Programs, MA5, PMA";
        doc.text(bossPos, centerX, sigY + 5, { align: "center" });

        const dateStr = new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        doc.setFontSize(7.5);
        doc.text(`dateprint: ${dateStr}`, startX + margin, sigY + 12);
        doc.text(`Page 1 of 1`, startX + width - margin, sigY + 12, { align: "right" });
      };

      // --- EXECUTION LOGIC ---
      if (columnLayout === "2") {
        // Form 1 (Left side)
        drawDTRForm(0, pageWidth / 2);

        // Form 2 (Right side)
        drawDTRForm(pageWidth / 2, pageWidth / 2);
      } else {
        // --- 1 COLUMN FORMAT: ADD OT IN/OUT ---
        const oneColumnHead = [[
          { content: "Date", styles: { halign: "left" } },
          "AM IN", "AM OUT", "PM IN", "PM OUT", "OT IN", "OT OUT"
        ]];
        const oneColumnBody = reportRows.map((row) => [
          formatDateForOneColumn(row.date),
          formatTimeForOneColumn(row.amIn),
          formatTimeForOneColumn(row.amOut),
          formatTimeForOneColumn(row.pmIn),
          formatTimeForOneColumn(row.pmOut),
          formatTimeForOneColumn(row.otIn),
          formatTimeForOneColumn(row.otOut),
        ]);

        drawOneColumnHeader(doc);

        const pageWidth = doc.internal.pageSize.getWidth();
        const marginLeft = 18;
        const tableWidth = 192 - marginLeft; // matches header lines (18 to 192)

        autoTable(doc, {
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
            5: { cellWidth: 19.5 },
            6: { cellWidth: 19.5 },
          },
          theme: "plain",
          didParseCell: (data) => {
            if (data.section === "head" && data.column.index === 0) {
              data.cell.styles.halign = "left";
            }
          },
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

        const finalY = doc.lastAutoTable?.finalY || 38;
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

  console.log("SIGNATORY IN PREVIEW:", signatory);

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
                  <p className="text-[11px] text-gray-500 mb-2 px-1">
                    Choose layout
                  </p>
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
              {reportRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 border-t border-gray-200 text-center text-gray-500"
                  >
                    No days with time entries to include in the report.
                  </td>
                </tr>
              ) : (
                reportRows.map((row, idx) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
