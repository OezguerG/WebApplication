import { Schema, model, Types } from "mongoose"
import { Gebiet } from "./GebietModel"
import { Prof } from "./ProfModel"

export interface IThema {
    titel: string
    beschreibung: string
    abschluss?: string
    status?: string
    gebiet: Types.ObjectId
    betreuer: Types.ObjectId
    updatedAt?: Date;
}

const ThemaSchema = new Schema<IThema>({
    titel: { type: String, required: true },
    beschreibung: { type: String, required: true },
    abschluss: { type: String, enum: ['bsc', 'msc', 'any'], default: 'any' },
    status: { type: String, enum: ['offen', 'reserviert'], default: 'offen' },
    gebiet: { type: Schema.Types.ObjectId, ref: "Gebiet", required: true },
    betreuer: { type: Schema.Types.ObjectId, ref: "Prof", required: true },
}, {
    timestamps: true
});

ThemaSchema.pre("save", async function (next) {
    const gebietExists = await Gebiet.exists({ _id: this.gebiet });
    if (!gebietExists) {
        throw new Error("Gebiet must be a valid ID");
    }
    next();

});

ThemaSchema.pre("save", async function (next) {

    const profExists = await Prof.exists({ _id: this.betreuer });
    if (!profExists) {
        throw new Error("Betreuer must be a valid ID");
    }
    next();

});

export const Thema = model<IThema>("Thema", ThemaSchema);