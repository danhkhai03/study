import { useState, useCallback } from 'react';
import api from '../api/axiosClient';
import type { Classroom, Student } from '../types';

interface UseClassroomsReturn {
    classrooms: Classroom[];
    isLoading: boolean;
    error: string | null;
    fetchClassrooms: () => Promise<void>;
    createClassroom: (name: string, theme?: string) => Promise<Classroom>;
    updateClassroom: (id: number, data: Partial<Classroom>) => Promise<Classroom>;
    deleteClassroom: (id: number) => Promise<void>;
}

export function useClassrooms(): UseClassroomsReturn {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchClassrooms = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get<Classroom[]>('/classrooms');
            setClassrooms(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load classrooms');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createClassroom = async (name: string, theme?: string): Promise<Classroom> => {
        const response = await api.post<Classroom>('/classrooms', { name, theme });
        setClassrooms(prev => [...prev, response.data]);
        return response.data;
    };

    const updateClassroom = async (id: number, data: Partial<Classroom>): Promise<Classroom> => {
        const response = await api.put<Classroom>(`/classrooms/${id}`, data);
        setClassrooms(prev => prev.map(c => c.id === id ? response.data : c));
        return response.data;
    };

    const deleteClassroom = async (id: number): Promise<void> => {
        await api.delete(`/classrooms/${id}`);
        setClassrooms(prev => prev.filter(c => c.id !== id));
    };

    return {
        classrooms,
        isLoading,
        error,
        fetchClassrooms,
        createClassroom,
        updateClassroom,
        deleteClassroom,
    };
}

interface UseClassroomReturn {
    classroom: Classroom | null;
    students: Student[];
    isLoading: boolean;
    error: string | null;
    fetchClassroom: (id: number) => Promise<void>;
    addStudent: (classroomId: number, name: string) => Promise<Student>;
    awardPoints: (studentId: number, amount: number, reason?: string) => Promise<void>;
    feedPet: (studentId: number, amount?: number) => Promise<{ leveledUp: boolean; newLevel: number }>;
}

export function useClassroom(): UseClassroomReturn {
    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchClassroom = useCallback(async (id: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const [clsRes, stuRes] = await Promise.all([
                api.get<Classroom>(`/classrooms/${id}`),
                api.get<Student[]>(`/classrooms/${id}/students`),
            ]);
            setClassroom(clsRes.data);
            setStudents(stuRes.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load classroom');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const addStudent = async (classroomId: number, name: string): Promise<Student> => {
        const response = await api.post<Student>(`/classrooms/${classroomId}/students`, { name });
        setStudents(prev => [...prev, response.data]);
        return response.data;
    };

    const awardPoints = async (studentId: number, amount: number, reason?: string): Promise<void> => {
        const response = await api.post<Student>(`/students/${studentId}/points`, { amount, reason });
        setStudents(prev => prev.map(s => s.id === studentId ? response.data : s));
    };

    const feedPet = async (studentId: number, amount: number = 1): Promise<{ leveledUp: boolean; newLevel: number }> => {
        const response = await api.post(`/students/${studentId}/feed`, { food_amount: amount });
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...response.data.student } : s));
        return response.data;
    };

    return {
        classroom,
        students,
        isLoading,
        error,
        fetchClassroom,
        addStudent,
        awardPoints,
        feedPet,
    };
}
