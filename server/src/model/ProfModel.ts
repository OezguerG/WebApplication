import { Schema, model, Model } from "mongoose"
import bcrypt from "bcryptjs"

export interface IProf {
    name: string
    titel?: string
    campusID: string
    password: string
    admin: boolean;
}

export interface IProfMethods {
    isCorrectPassword(passedPassword: string): Promise<boolean>;
}

type ProfModel = Model<IProf, {}, IProfMethods>;

const ProfSchema = new Schema<IProf, ProfModel, IProfMethods>({
    name: { type: String, required: true },
    titel: { type: String },
    campusID: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    admin: { type: Boolean, default: false }
});

ProfSchema.method(
  "isCorrectPassword",
  async function (password: string): Promise<boolean> {
    if (this.password.slice(0,4) !== "$2a$" || !this.password) {
        throw new Error("Password not hashed");
    }
    return await bcrypt.compare(password, this.password);
  }
);

ProfSchema.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10)
    }
    
});

ProfSchema.pre("save", async function (next) {
    const existingProf = await Prof.findOne({ campusID: this.campusID });
    if (existingProf && existingProf._id.toString() !== this._id.toString()) {
        throw new Error("CampusID must be unique");
    }

    next();
});

ProfSchema.pre("updateOne", async function () {
    const updateProf = this.getUpdate();
    if (updateProf && "password" in updateProf) {
        updateProf.password = await bcrypt.hash(updateProf.password, 10);
    }
});



export const Prof = model<IProf, ProfModel>("Prof", ProfSchema);