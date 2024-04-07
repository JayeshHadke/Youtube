import mongooes, { Schema } from 'mongoose';
import { aggregatePaginate } from 'mongoose-aggregate-paginate-v2';

var videoSchema = new Schema({
    videoFile: { type: String, required: true },
    thumbnail: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    duration: { type: Number, required: true },
    views: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
}, { timestamps: true });

videoSchema.plugin(aggregatePaginate);

export const Video = mongooes.model('Video', videoSchema);