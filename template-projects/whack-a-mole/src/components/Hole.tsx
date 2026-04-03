import type { RoundAnswer } from "../type";

type Props = {
    index: number;
    active: boolean;
    goingDown: boolean;
    data?: RoundAnswer;
    hitState?: "correct" | "wrong";
    onClick: (index: number) => void;
};

export default function Hole({
    index,
    active,
    goingDown,
    data,
    hitState,
    onClick,
}: Props) {
    return (
        <div onClick={() => active && onClick(index)}>
            <div
                className={`moles-hole ${active ? "up" : (goingDown ? "down" : "")} ${hitState}`}
            >
                <div className="mole-bubble">
                    {data?.image && <img src={data.image} alt="" />}
                    {data?.text && <div>{data.text}</div>}
                </div>
            </div>
        </div>
    );
}