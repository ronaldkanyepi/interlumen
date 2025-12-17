import { InterviewRoomView } from "@/components/interview/room/room-view";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function InterviewRoomPage({ params }: PageProps) {
    const { id } = await params;
    return (
        <div className="min-h-screen bg-background text-foreground">
            <InterviewRoomView sessionId={id} />
        </div>
    );
}
