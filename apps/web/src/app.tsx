
import { sum } from "@react-template/math"

import { cn } from "~/ui/lib/utils"

function App(): React.ReactNode {
    const a = 10
    const b = 12

    return (
        <div className={cn("mx-2")}>Hello world {sum(a, b)}
        </div>
    )
}

export default App
