import Button from "@/components/atom/button";
import { Bookmark } from "lucide-react";
import { ExternalLink } from "lucide-react";
import Image from 'next/image';

interface CardItemProps {
    title: string;
    description: string;
    price: number;
    urlPhoto: string;
    openLink: string;
}

const CardItem: React.FC<CardItemProps> = ({ title, description, price, urlPhoto, openLink }) => {

    return (
        <>
            <div className="flex flex-row gap-x-4">
                <div className="w-2/5 bg-primary-100 rounded-2xl">
                    <figure className="w-full h-34 relative">
                        <Image
                            src={urlPhoto}
                            alt={`Photo ${title}`}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-2xl"
                        />
                    </figure>
                </div>

                <div className="w-3/5 flex flex-col items-start justify-between">
                    <div>
                        <h2 className="font-semibold font-logo text-2xl pb-2">{title}</h2>
                        <p className="text-sm font-normal font-outfit">{description}</p>
                    </div>
                    <span className="self-stretch justify-center text-black text-2xl font-semibold font-montserrat pb-2">{price} €</span>
                </div>
            </div>
            <div className="flex flex-row w-full gap-x-2">
                <Button
                    variant="default"
                    size="default"
                    className="text-base font-semibold"
                >
                    Enregistrer
                    <Bookmark className="" />
                </Button>
                <Button
                    variant="secondary"
                    size="default"
                    className="text-base font-semibold"
                    openLink={openLink}
                >
                    Consulter
                    <ExternalLink className="" />
                </Button>
            </div>
            <hr className="w-full border-primary-700" />
        </>
    );
}

export default CardItem;