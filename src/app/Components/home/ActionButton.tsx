export default function ActionButton({ Icon, count }: { Icon: any, count: number }) {

    return (
        <button onClick={() => { console.log("click") }} className="flex flex-col justify-center items-center">
            <Icon color="white" size={30} className="drop-shadow" />
            <span className="text-xl text-white font-semibold">{count}</span>
        </button>
    );
}