import { Progress } from "@radix-ui/themes";

interface GoalCardProps {
    name: string;
    target: number;
    current: number;
}

export const GoalCard = ({name, target, current}: GoalCardProps) => {

    const percentage = current / target * 100

    return (
        <div className="bg-gray-800 p-5 rounded-md">

        <div className="flex justify-between mb-3">
            <div className="dark:text-white font-bold">{name}</div>
            <div className="text-green-400 font-bold">${target.toFixed(2)}</div>

        </div>
        <Progress value={percentage}></Progress>
        </div>
    )
}