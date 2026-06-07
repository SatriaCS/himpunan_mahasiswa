export default function Pagination({
    currentPage,
    totalPages,
    onPageChange
}) {

    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <div className="flex justify-center gap-2 mt-6">

            {/* PREVIOUS */}
            <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="px-3 py-1 cursor-pointer border rounded disabled:opacity-40 disabled:bg-transparent disabled:text-black text-black border-black hover:bg-indigo-600  hover:text-white"
            >
                Prev
            </button>

            {/* NUMBER */}
            {pages.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 cursor-pointer border rounded text-black border-black hover:bg-indigo-600  hover:text-white
                        ${currentPage === page
                            ? "bg-indigo-600 text-white"
                            : "bg-white"}
                    `}
                >
                    {page}
                </button>
            ))}

            {/* NEXT */}
            <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="px-3 py-1 cursor-pointer border rounded hover:bg-indigo-600  hover:text-white disabled:opacity-40 disabled:bg-transparent disabled:text-black text-black border-black"
            >
                Next
            </button>

        </div>
    );
}