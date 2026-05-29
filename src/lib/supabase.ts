import { createClient } from '@supabase/supabase-js';

// Get Environment Variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize live Supabase Client only if variables exist
export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Log initialization status
if (supabase) {
    console.log("Veltria: Connected to live Supabase Backend.");
} else {
    console.warn("Veltria: Supabase keys missing. Running in local simulation mode (LocalStorage).");
}

// ==========================================================================
// SEED MOCK DATA (For Local Storage Fallback Mode)
// ==========================================================================
const MOCK_EMPLOYEES = [
    { id: "emp-1", name: "John Doe", email: "employee@company.com", role: "Software Engineer", department: "Engineering", is_admin: false, created_at: "2026-05-20T09:00:00Z" },
    { id: "emp-2", name: "Varshitha", email: "varshitha@company.com", role: "Project Lead", department: "Engineering", is_admin: false, created_at: "2026-05-20T09:00:00Z" },
    { id: "emp-3", name: "Sarah Connor", email: "designer@company.com", role: "Lead Designer", department: "Design", is_admin: false, created_at: "2026-05-20T09:00:00Z" },
    { id: "emp-4", name: "Tony Stark", email: "marketer@company.com", role: "Growth Specialist", department: "Marketing", is_admin: false, created_at: "2026-05-20T09:00:00Z" },
    { id: "admin-1", name: "System Admin", email: "admin@company.com", role: "System Admin", department: "Management", is_admin: true, created_at: "2026-05-20T09:00:00Z" }
];

const MOCK_PASSWORDS: Record<string, string> = {
    "employee@company.com": "emp123",
    "varshitha@company.com": "varsh123",
    "designer@company.com": "design123",
    "marketer@company.com": "mark123",
    "admin@company.com": "admin123"
};

const MOCK_TIMESHEETS = [
    {
        id: "ts-1",
        employee_id: "emp-1",
        date: "2026-05-20",
        project: "Internal Development",
        start_time: "09:00",
        end_time: "17:00",
        hours: 8.0,
        description: "Implemented custom UI buttons and refined CSS variables for the main portal.",
        status: "approved",
        processed_date: "2026-05-21"
    },
    {
        id: "ts-2",
        employee_id: "emp-1",
        date: "2026-05-21",
        project: "Client: Orion System",
        start_time: "08:30",
        end_time: "18:00",
        hours: 9.5,
        description: "Integrated API endpoints and resolved data mapping schema conflicts.",
        status: "approved",
        processed_date: "2026-05-22"
    },
    {
        id: "ts-3",
        employee_id: "emp-1",
        date: "2026-05-22",
        project: "Client: Orion System",
        start_time: "09:00",
        end_time: "17:00",
        hours: 8.0,
        description: "Drafted test coverage scripts and verified build logs on sandbox environment.",
        status: "pending",
        processed_date: null
    },
    {
        id: "ts-4",
        employee_id: "emp-1",
        date: "2026-05-25",
        project: "System Maintenance",
        start_time: "10:00",
        end_time: "14:30",
        hours: 4.5,
        description: "Ran routine server security audits and verified SSL renewals.",
        status: "approved",
        processed_date: "2026-05-25"
    },
    {
        id: "ts-5",
        employee_id: "emp-2",
        date: "2026-05-20",
        project: "Client: Orion System",
        start_time: "09:00",
        end_time: "18:00",
        hours: 9.0,
        description: "Client alignment meeting and architecture roadmap presentation.",
        status: "approved",
        processed_date: "2026-05-21"
    },
    {
        id: "ts-6",
        employee_id: "emp-2",
        date: "2026-05-21",
        project: "Internal Development",
        start_time: "09:00",
        end_time: "17:30",
        hours: 8.5,
        description: "Refining project goals, sprint planning, and task distributions.",
        status: "approved",
        processed_date: "2026-05-22"
    },
    {
        id: "ts-7",
        employee_id: "emp-2",
        date: "2026-05-25",
        project: "Internal Development",
        start_time: "09:00",
        end_time: "17:00",
        hours: 8.0,
        description: "Sprint review meeting and documentation update.",
        status: "pending",
        processed_date: null
    },
    {
        id: "ts-8",
        employee_id: "emp-3",
        date: "2026-05-21",
        project: "Internal Development",
        start_time: "10:00",
        end_time: "16:00",
        hours: 6.0,
        description: "Created wireframes for the user onboarding flow.",
        status: "approved",
        processed_date: "2026-05-22"
    },
    {
        id: "ts-9",
        employee_id: "emp-3",
        date: "2026-05-22",
        project: "Marketing Research",
        start_time: "09:00",
        end_time: "17:00",
        hours: 8.0,
        description: "Designed assets for the upcoming Q3 product newsletter campaign.",
        status: "rejected",
        processed_date: "2026-05-23"
    },
    {
        id: "ts-10",
        employee_id: "emp-4",
        date: "2026-05-20",
        project: "Marketing Research",
        start_time: "08:00",
        end_time: "18:00",
        hours: 10.0,
        description: "Competitor positioning analysis and SEM target keywords planning.",
        status: "approved",
        processed_date: "2026-05-21"
    },
    {
        id: "ts-11",
        employee_id: "emp-4",
        date: "2026-05-22",
        project: "Marketing Research",
        start_time: "09:00",
        end_time: "16:30",
        hours: 7.5,
        description: "Ad copy drafting and landing page performance analytics review.",
        status: "pending",
        processed_date: null
    }
];

// Helper to initialize local storage simulation
function initLocalMock() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('ems_mock_initialized')) {
        localStorage.setItem('ems_mock_employees', JSON.stringify(MOCK_EMPLOYEES));
        localStorage.setItem('ems_mock_passwords', JSON.stringify(MOCK_PASSWORDS));
        localStorage.setItem('ems_mock_timesheets', JSON.stringify(MOCK_TIMESHEETS));
        localStorage.setItem('ems_mock_clock_states', JSON.stringify({}));
        localStorage.setItem('ems_mock_initialized', 'true');
    }
}

// Read from LocalStorage helper
function getLocalMockData(key: string) {
    initLocalMock();
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem(`ems_mock_${key}`) || '[]');
}

// Write to LocalStorage helper
function saveLocalMockData(key: string, data: any) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`ems_mock_${key}`, JSON.stringify(data));
}

// ==========================================================================
// UNIFIED DATABASE SERVICE (Supabase with Local Simulation Fallback)
// ==========================================================================
export const db = {
    // 1. Authentication
    async signIn(email: string, password: string) {
        if (supabase) {
            // Live Supabase Authenticate
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
            if (authError) throw new Error(authError.message);
            
            // Resolve Profile Details
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authData.user.id)
                .single();
                
            if (profileError) throw new Error(profileError.message);
            return profile;
        } else {
            // Mock Local Authenticate
            initLocalMock();
            const employees = getLocalMockData('employees') as any[];
            const passwords = JSON.parse(localStorage.getItem('ems_mock_passwords') || '{}');
            
            const emp = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
            if (!emp || passwords[emp.email] !== password) {
                throw new Error("Invalid credentials or user does not exist.");
            }
            
            // Save mock session
            localStorage.setItem('ems_mock_session', JSON.stringify(emp));
            return emp;
        }
    },

    async signOut() {
        if (supabase) {
            await supabase.auth.signOut();
        } else {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('ems_mock_session');
            }
        }
    },

    async getCurrentUser() {
        if (supabase) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;
            
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
                
            return profile;
        } else {
            if (typeof window === 'undefined') return null;
            const session = localStorage.getItem('ems_mock_session');
            return session ? JSON.parse(session) : null;
        }
    },

    // 2. Clock states
    async getClockState(employeeId: string) {
        if (supabase) {
            const { data, error } = await supabase
                .from('clock_states')
                .select('*')
                .eq('employee_id', employeeId)
                .maybeSingle();
                
            if (error) throw new Error(error.message);
            return data;
        } else {
            const states = JSON.parse(localStorage.getItem('ems_mock_clock_states') || '{}');
            return states[employeeId] || null;
        }
    },

    async setClockState(employeeId: string, isClockedIn: boolean, startTime: string | null, project: string) {
        if (supabase) {
            const { error } = await supabase
                .from('clock_states')
                .upsert({
                    employee_id: employeeId,
                    is_clocked_in: isClockedIn,
                    start_time: startTime,
                    project,
                    updated_at: new Date().toISOString()
                });
                
            if (error) throw new Error(error.message);
        } else {
            const states = JSON.parse(localStorage.getItem('ems_mock_clock_states') || '{}');
            if (isClockedIn) {
                states[employeeId] = {
                    employee_id: employeeId,
                    is_clocked_in: isClockedIn,
                    start_time: startTime,
                    project
                };
            } else {
                delete states[employeeId];
            }
            localStorage.setItem('ems_mock_clock_states', JSON.stringify(states));
        }
    },

    // 3. Timesheets
    async getTimesheets(employeeId?: string) {
        if (supabase) {
            let query = supabase.from('timesheets').select('*');
            if (employeeId) {
                query = query.eq('employee_id', employeeId);
            }
            const { data, error } = await query;
            if (error) throw new Error(error.message);
            return data || [];
        } else {
            const list = getLocalMockData('timesheets') as any[];
            if (employeeId) {
                return list.filter(t => t.employee_id === employeeId);
            }
            return list;
        }
    },

    async createTimesheet(timesheet: {
        employee_id: string;
        date: string;
        project: string;
        start_time: string;
        end_time: string;
        hours: number;
        description: string;
        status: 'approved' | 'pending' | 'rejected';
        processed_date?: string | null;
    }) {
        if (supabase) {
            const { data, error } = await supabase
                .from('timesheets')
                .insert([timesheet])
                .select()
                .single();
                
            if (error) throw new Error(error.message);
            return data;
        } else {
            const list = getLocalMockData('timesheets') as any[];
            const newTs = {
                id: `ts-${Date.now()}`,
                ...timesheet,
                processed_date: timesheet.processed_date || null
            };
            list.push(newTs);
            saveLocalMockData('timesheets', list);
            return newTs;
        }
    },

    async updateTimesheetStatus(timesheetId: string, status: 'approved' | 'rejected', processedDate: string) {
        if (supabase) {
            const { error } = await supabase
                .from('timesheets')
                .update({ status, processed_date: processedDate })
                .eq('id', timesheetId);
                
            if (error) throw new Error(error.message);
        } else {
            const list = getLocalMockData('timesheets') as any[];
            const idx = list.findIndex(t => t.id === timesheetId);
            if (idx !== -1) {
                list[idx].status = status;
                list[idx].processed_date = processedDate;
                saveLocalMockData('timesheets', list);
            }
        }
    },

    // 4. Employees Directory (Admin Views)
    async getEmployees() {
        if (supabase) {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('is_admin', false);
            if (error) throw new Error(error.message);
            return data || [];
        } else {
            const list = getLocalMockData('employees') as any[];
            return list.filter(e => !e.is_admin);
        }
    },

    async createEmployee(employee: {
        name: string;
        email: string;
        role: string;
        department: string;
        password?: string;
    }) {
        if (supabase) {
            // Under Supabase, creating users requires calling sign-up or admin api.
            // For standard demo, we trigger supabase.auth.signUp
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: employee.email,
                password: employee.password || 'password123',
                options: {
                    data: {
                        name: employee.name,
                        role: employee.role,
                        department: employee.department,
                        is_admin: false
                    }
                }
            });
            if (authError) throw new Error(authError.message);
            
            // Note: If you configure a trigger in postgres database, profiles row is auto created.
            // If not, we manually check if we can insert it here.
            if (authData.user) {
                const { error: profError } = await supabase.from('profiles').upsert({
                    id: authData.user.id,
                    name: employee.name,
                    email: employee.email,
                    role: employee.role,
                    department: employee.department,
                    is_admin: false
                });
                if (profError) {
                    console.error("Profiles insertion warning (it might have been auto inserted by trigger):", profError.message);
                }
            }
            return authData.user;
        } else {
            const list = getLocalMockData('employees') as any[];
            const passwords = JSON.parse(localStorage.getItem('ems_mock_passwords') || '{}');
            
            const emailLower = employee.email.toLowerCase();
            if (list.some(e => e.email.toLowerCase() === emailLower)) {
                throw new Error("An employee account with this email already exists.");
            }
            
            const newEmp = {
                id: `emp-${Date.now()}`,
                name: employee.name,
                email: emailLower,
                role: employee.role,
                department: employee.department,
                is_admin: false,
                created_at: new Date().toISOString()
            };
            
            list.push(newEmp);
            passwords[emailLower] = employee.password || 'password123';
            
            saveLocalMockData('employees', list);
            localStorage.setItem('ems_mock_passwords', JSON.stringify(passwords));
            return newEmp;
        }
    },

    async deleteEmployee(employeeId: string) {
        if (supabase) {
            // For Supabase, deactivating employees is usually done by deleting or updates.
            // Standard delete from profiles (cascade deletes timesheets/clock states)
            const { error } = await supabase.from('profiles').delete().eq('id', employeeId);
            if (error) throw new Error(error.message);
        } else {
            let list = getLocalMockData('employees') as any[];
            const emp = list.find(e => e.id === employeeId);
            if (!emp) return;
            
            list = list.filter(e => e.id !== employeeId);
            saveLocalMockData('employees', list);
            
            // Clean up password
            const passwords = JSON.parse(localStorage.getItem('ems_mock_passwords') || '{}');
            delete passwords[emp.email];
            localStorage.setItem('ems_mock_passwords', JSON.stringify(passwords));
            
            // Clean up timesheets
            let tsList = getLocalMockData('timesheets') as any[];
            tsList = tsList.filter(t => t.employee_id !== employeeId);
            saveLocalMockData('timesheets', tsList);
            
            // Clean up clock state
            const states = JSON.parse(localStorage.getItem('ems_mock_clock_states') || '{}');
            delete states[employeeId];
            localStorage.setItem('ems_mock_clock_states', JSON.stringify(states));
        }
    }
};
