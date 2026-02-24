-- ===========================================
-- CodeJudge - PostgreSQL Database Schema
-- Compatible with Neon DB & local PostgreSQL
-- ===========================================

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

-- ===========================================
-- TABLES
-- ===========================================

CREATE TABLE IF NOT EXISTS public.users (
    userid SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    user_email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'student',
    avatar TEXT DEFAULT 'https://api.dicebear.com/9.x/initials/svg?seed=User',
    gemini_api_key TEXT
);

CREATE TABLE IF NOT EXISTS public.courses (
    course_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.users(userid) ON DELETE CASCADE,
    course_id INTEGER REFERENCES public.courses(course_id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    has_attempted BOOLEAN DEFAULT false,
    is_disqualified BOOLEAN DEFAULT false,
    warnings_count INTEGER DEFAULT 0,
    UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.pending_enrollments (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    course_id INTEGER REFERENCES public.courses(course_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(email, course_id)
);

CREATE TABLE IF NOT EXISTS public.assignments (
    assignment_id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES public.courses(course_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 60,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.questions (
    quesid SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    category VARCHAR(100),
    testcases TEXT,
    assignment_id INTEGER NOT NULL REFERENCES public.assignments(assignment_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.assignment_attempts (
    user_id INTEGER NOT NULL REFERENCES public.users(userid) ON DELETE CASCADE,
    assignment_id INTEGER NOT NULL REFERENCES public.assignments(assignment_id) ON DELETE CASCADE,
    has_attempted BOOLEAN DEFAULT false,
    is_disqualified BOOLEAN DEFAULT false,
    warnings_count INTEGER DEFAULT 0,
    started_at TIMESTAMP,
    submitted_at TIMESTAMP,
    time_remaining INTEGER,
    PRIMARY KEY (user_id, assignment_id)
);

CREATE TABLE IF NOT EXISTS public.solutions (
    solutionid SERIAL PRIMARY KEY,
    userid INTEGER REFERENCES public.users(userid),
    quesid INTEGER REFERENCES public.questions(quesid),
    anskey JSON
);

CREATE TABLE IF NOT EXISTS public.solved_questions (
    user_id INTEGER NOT NULL REFERENCES public.users(userid),
    question_id INTEGER NOT NULL REFERENCES public.questions(quesid),
    course_id INTEGER REFERENCES public.courses(course_id),
    points INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, question_id)
);
