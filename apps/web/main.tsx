import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./app.tsx"

// oxlint-disable-next-line no-non-null-assertion
createRoot(document.querySelector("#root")!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
