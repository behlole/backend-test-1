import Entity, { ID } from './Entity';
import {ObjectId} from "mongoose";
export default class Blog extends Entity {
    title: string;
    description: string;
    date_time: string;
    main_image: string;
    additional_images?: string[];
    reference: string;
    users?:string[]|number[];

    constructor({
                    id,
                    title,
                    description,
                    date_time,
                    main_image,
                    additional_images,
                    reference,
                    users
                }: {
        id?: ID,
        title: string,
        description: string,
        date_time: string,
        main_image: string,
        additional_images: string[],
        reference:string,
        users?:string[]|number[]
    }) {
        super({ id });
        this.title = title;
        this.description = description;
        this.date_time = date_time;
        this.main_image = main_image;
        this.additional_images = additional_images;
        this.reference=reference
        this.users=users
    }
};
