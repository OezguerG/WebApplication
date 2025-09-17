import { Schema, model, Types } from "mongoose"
import { Prof } from "../../src/model/ProfModel";

export interface IGebiet {
    name: string
    beschreibung?: string
    public?: boolean
    closed?: boolean
    verwalter: Types.ObjectId
    createdAt?: Date
}

const GebietSchema = new Schema<IGebiet>({
    name: { type: String, required: true },
    beschreibung: { type: String },
    public: { type: Boolean, default: false },
    closed: { type: Boolean, default: false },
    verwalter: { type: Schema.Types.ObjectId, ref: "Prof", required: true }
}, {
    timestamps: true
});

GebietSchema.pre("save", async function (next) {
    const verwalterExists = await Prof.exists({ _id: this.verwalter });
    if (!verwalterExists) {
        throw new Error("Verwalter must be a valid Prof ID");
    }
    next();
});

export const Gebiet = model<IGebiet>("Gebiet", GebietSchema);