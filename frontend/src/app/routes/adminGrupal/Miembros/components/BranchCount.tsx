import { branchCounts } from "@/lib/mockObjects";

const BranchCount = () => {
    return (
        <>
        {branchCounts.map((item) => (
          <div
            className={`border rounded-xl shadow-sm p-3 flex items-center gap-3 w-1/5`}
          >
            <div className="p-3">
              <p className="text-sm md:text-lg text-primary mb-2">
                {item.value}
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
