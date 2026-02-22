import * as z from "zod"
import { oc, type ContractRouterClient } from "@orpc/contract"

const PlanetSchema = z.object({
    id:   z.uuidv4(),
    name: z.string(),
})

export type Planet = z.infer<typeof PlanetSchema>

const createPlanetContract = oc.input(
    PlanetSchema.omit({ id: true }),
).output(PlanetSchema)

const listPlanetContract = oc.output(z.object({
    data: z.array(PlanetSchema),
}))

export const contract = {
    planet: {
        create: createPlanetContract,
        list:   listPlanetContract,
    },
} as const

export type ContractTypeClient = ContractRouterClient<typeof contract>
