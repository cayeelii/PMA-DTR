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
    const doc = new jsPDF();
    drawPdfHeader(doc);

    let finalY = 58;

    if (columnLayout === "2") {
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
    } else {
      autoTable(doc, {
        startY: 38,
        head: tableHead,
        body: tableData,
        styles: {
          fontSize: 8,
          halign: "center",
        },
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: 0,
          fontStyle: "bold",
        },
        columnStyles: {
          0: { halign: "left" },
          1: { halign: "left" },
        },
        theme: "grid",
      });

      finalY = (doc.lastAutoTable?.finalY || 38) + 20;
    }

    drawSignatory(doc, finalY);

    doc.save(`${employee?.name || "DTR"}_Report.pdf`);
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
