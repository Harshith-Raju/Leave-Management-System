const { mongoose } = require('../config/database');

const CounterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

CounterSchema.statics.next = async function next(name) {
  const doc = await this.findOneAndUpdate(
    { name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return doc.seq;
};

module.exports = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);

