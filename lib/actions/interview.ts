"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth/config"
import { headers } from "next/headers"

export async function createInterviewSession(data: {
    title: string;
    type: string;
    resumeText: string;
    jobDescription: string;
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) throw new Error("Unauthorized");

    const newSession = await prisma.interviewSession.create({
        data: {
            userId: session.user.id,
            title: data.title,
            type: data.type,
            score: 0,
            duration: 0,
            feedbackSummary: {},
            resumeText: data.resumeText,
            jobDescription: data.jobDescription
        }
    });

    return newSession;
}

export async function updateInterviewSession(id: string, data: {
    score: number;
    duration: number;
    feedbackRaw?: any;
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) throw new Error("Unauthorized");

    const existing = await prisma.interviewSession.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) throw new Error("Unauthorized");

    return await prisma.interviewSession.update({
        where: { id },
        data: {
            score: data.score,
            duration: data.duration,
            feedbackSummary: data.feedbackRaw || {}
        }
    });
}

export async function getInterviewSession(id: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) return null;

    const interview = await prisma.interviewSession.findUnique({
        where: { id },
        include: { questions: true }
    });

    if (!interview || interview.userId !== session.user.id) return null;

    return interview;
}

export async function getUserHistory() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) return [];

    return await prisma.interviewSession.findMany({
        where: { userId: session.user.id },
        include: { questions: true },
        orderBy: { createdAt: 'desc' }
    });
}

export async function deleteUserHistory() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) throw new Error("Unauthorized");

    await prisma.interviewSession.deleteMany({
        where: { userId: session.user.id }
    });

    return { success: true };
}
