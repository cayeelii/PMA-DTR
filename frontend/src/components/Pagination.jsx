import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

/**
 * Pagination component for page navigation.
 * @param {number} page 
 * @param {number} totalPages 
 * @param {function} onPageChange 
 */
function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  
  const getPages = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, "ellipsis", totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages);
      }
    }
    return pages;
  };

  return (
    <nav className="flex items-center justify-center gap-2 mt-4" aria-label="Pagination">
      <button
        className="p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <ChevronLeft />
      </button>
      {getPages().map((p, idx) =>
        p === "ellipsis" ? (
          <span key={"ellipsis-" + idx} className="px-2 text-gray-400" aria-hidden="true">
            <MoreHorizontal />
          </span>
        ) : (
          <button
            key={p}
            className={`px-3 py-1 rounded ${p === page ? "bg-blue-600 text-white" : "hover:bg-gray-200"}`}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
            aria-label={p === page ? `Page ${p}, current` : `Go to page ${p}`}
            disabled={p === page}
          >
            {p}
          </button>
        )
      )}
      <button
        className="p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        <ChevronRight />
      </button>
    </nav>
  );
}

export default Pagination;
