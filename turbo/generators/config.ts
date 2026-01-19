import { PlopTypes } from "@turbo/gen"

export default function generator(plop: PlopTypes.NodePlopAPI): void {
    plop.setGenerator("package", {
        actions: [
            {
                path:         "{{ turbo.paths.root }}/packages/{{ dashCase dirname }}/package.json",
                templateFile: "templates/package.hbs",
                type:         "add",
            },
            {
                path:         "{{ turbo.paths.root }}/packages/{{ dashCase dirname }}/.oxlintrc.json",
                templateFile: "templates/.oxlintrc.json",
                type:         "add",
            },
            {
                path:         "{{ turbo.paths.root }}/packages/{{ dashCase dirname }}/eslint.config.ts",
                templateFile: "templates/eslint.config.ts",
                type:         "add",
            },
            {
                path:         "{{ turbo.paths.root }}/packages/{{ dashCase dirname }}/tsconfig.json",
                templateFile: "templates/tsconfig.hbs",
                type:         "add",
            },
            {
                path:     "{{ turbo.paths.root }}/packages/{{ dashCase dirname }}/index.ts",
                template: "export * from \"./src\"\n",
                type:     "add",
            },
            {
                path:     "{{ turbo.paths.root }}/packages/{{ dashCase dirname }}/src/index.ts",
                template: "export {}\n",
                type:     "add",
            },
        ],
        description:
      "A turborepo generator that creates a package",
        prompts: [
            {
                message:  "What is the directory name of the package?",
                name:     "dirname",
                type:     "input",
                validate: (input: string) => {
                    if (input.includes(".")) {
                        return "dirname cannot include an extension"
                    }
                    if (input.includes(" ")) {
                        return "dirname cannot include spaces"
                    }
                    if (!input) {
                        return "dirname is required"
                    }
                    return true
                },
            },
            {
                message: "What should be the title of the new package?",
                name:    "title",
                type:    "input",
            },
        ],
    })
}
