
import { sum } from "@react-template/math"

import { cn } from "~/ui/lib/utils"

function App(): React.JSX.Element {
    return (
        <div className={cn("mx-2")}>Hello world {sum(10, 12)}</div>
    )
}

export default App
