import Button from "@/components/atom/button";
import { Bookmark } from "lucide-react";
import { ExternalLink } from "lucide-react";

export default function CardItem({ title, description, price, urlPhoto, openLink }: { title: string, description: string, price: number, urlPhoto: string, openLink: string }) {

    return (
        <>
            <div className="flex flex-row gap-x-4">
                <div className="w-2/5 bg-primary-100 rounded-2xl">
                    <img src={urlPhoto} alt={`Photo ${title}`} className="w-full h-34 object-cover rounded-2xl" />
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
                    // onClick={() => setIsModalOpen(true)}
                    variant="default"
                    size="default"
                    children={<span className="text-base font-semibold">Enregistrer</span>}
                    iconLeft={<Bookmark className="" />}
                />
                <Button
                    // onClick={() => setIsModalOpen(true)}
                    variant="secondary"
                    size="default"
                    children={<span className="text-base font-semibold ">Consulter</span>}
                    iconLeft={<ExternalLink className="" />}
                    openLink={openLink}
                />
            </div>
            <hr className="w-full border-primary-700" />
        </>
    );
}