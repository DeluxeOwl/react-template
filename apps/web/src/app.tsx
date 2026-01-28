
import { sum } from "@react-template/math"

import { cn } from "~/ui/lib/utils"

// How would you refactor this?
// function FieldError({
//     children,
//     className,
//     errors,
//     ...props
// }: React.ComponentProps<"div"> & {
//     errors?: (undefined | { message?: string })[]
// }) {
//     const content = useMemo(() => {
//         if (children) {
//             return children
//         }

//         if (!errors?.length) {
//             return null
//         }

//         const uniqueErrors = [...new Map(errors.map((error) => [error?.message, error])).values()]

//         if (uniqueErrors?.length === 1) {
//             return uniqueErrors[0]?.message
//         }

//         return (
//             <ul className="ml-4 flex list-disc flex-col gap-1">
//                 {uniqueErrors.map(
//                     (error, index) =>
//                         error?.message && <li key={index}>{error.message}</li>,
//                 )}
//             </ul>
//         )
//     }, [children, errors])

//     if (!content) {
//         return null
//     }

//     return (
//         <div
//             className={cn("text-sm font-normal text-destructive", className)}
//             data-slot="field-error"
//             role="alert"
//             {...props}>
//             {content}
//         </div>
//     )
// }

function App(): React.ReactNode {
    const a = 10
    const b = 12

    return (
        <div className={cn("px-2")}>Hello world {sum(a, b)}
        </div>
    )
}

export default App
