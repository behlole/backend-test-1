import Entity, { ID } from './Entity';
export default class Blog extends Entity {
    title: string;
    description: string;
    date_time: string;
    main_image: string;
    additional_images?: string[];
    reference: string;

    constructor({
                    id,
                    title,
                    description,
                    date_time,
                    main_image,
                    additional_images,
                    reference,
                }: {
        id?: ID,
        title: string,
        description: string,
        date_time: string,
        main_image: string,
        additional_images: string[],
        reference:string
    }) {
        super({ id });
        this.title = title;
        this.description = title;
        this.date_time = title;
        this.main_image = title;
        this.additional_images = additional_images;
        this.reference=reference
    }
};
