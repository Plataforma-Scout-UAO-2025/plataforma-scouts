import { branchCounts } from "@/lib/mockObjects";

const BranchCount = () => {
    return (
        <>
        {branchCounts.map((item, index) => (
          <div
            key={index}
            className={`border rounded-xl shadow-sm p-3 flex items-center gap-3 w-1/5`}
          >
            <div className="p-3">
              <p className="text-sm md:text-lg text-primary mb-2">
                0
              </p>
              <p className="text-sm md:text-lg text-text font-bold">
                {item.label}
              </p>
            </div>
          </div>
        ))}</>
    )
}

export default BranchCount
