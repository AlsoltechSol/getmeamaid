'use client';

import React, { useState } from 'react';
import { useAdmin } from '../AdminContext';
import { Search, Sparkles } from 'lucide-react';

export default function AssignedJobSection() {
  const {
    staff,
    actingStaffId, setActingStaffId,
    bookings,
    currentUser,
    setSelectedBooking,
    setDrawerTab
  } = useAdmin();

  // Local Filter States
  const [search, setSearch] = useState('');
  const [statusVal, setStatusVal] = useState('all');
  const [dateVal, setDateVal] = useState('');

  // A user is a real field staff if their authenticated role is 4
  const isRealFieldStaff = String(currentUser?.role_id) === '4';

  // Determine active staff filter target
  const activeStaffFilter = isRealFieldStaff ? String(currentUser?.id) : actingStaffId;

  // Filter Bookings list
  const filteredBookings = bookings
    // 1. Filter by assigned staff (or show all assigned if admin picks 'all')
    .filter(b => {
      if (isRealFieldStaff) {
        return String(b.assigned_staff_id) === String(currentUser?.id);
      }
      if (activeStaffFilter === 'all') {
        return b.assigned_staff_id !== undefined && b.assigned_staff_id !== null;
      }
      return String(b.assigned_staff_id) === String(activeStaffFilter);
    })
    // 2. Filter by status
    .filter(b => {
      if (statusVal === 'all') return true;
      if (statusVal === 'Allocated') return !b.staff_job_status || b.staff_job_status === 'Pending';
      return b.staff_job_status === statusVal;
    })
    // 3. Filter by date
    .filter(b => !dateVal || b.selected_date === dateVal)
    // 4. Filter by text search (customer name, ID, postal code)
    .filter(b => {
      if (!search) return true;
      const term = search.toLowerCase();
      const fullName = `${b.first_name} ${b.last_name}`.toLowerCase();
      return fullName.includes(term) || b.id.toLowerCase().includes(term) || (b.postal_code || '').toLowerCase().includes(term);
    });



  return (
    <div className="space-y-4">
      {/* 1. Header & Quick Selector Desk */}
      <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-3xs">
        <div className="flex justify-between items-start border-b border-neutral-100 pb-3">
          <div>
            <h3 className="text-[10px] font-bold font-mono tracking-wider uppercase text-neutral-400">
              {isRealFieldStaff ? 'Personal Work Dashboard' : 'Operational Curator Dispatch Board'}
            </h3>
            <h2 className="text-xl font-bold text-neutral-900 mt-1">
              {isRealFieldStaff 
                ? `${currentUser?.name} — Assigned Jobs` 
                : (activeStaffFilter === 'all' 
                    ? 'All Dispatch Jobs' 
                    : `${staff.find(s => String(s.id) === String(activeStaffFilter))?.name || 'Curator'} Dispatch`
                  )}
            </h2>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase font-mono tracking-wider ${isRealFieldStaff ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-neutral-100 text-neutral-800 border'}`}>
            {isRealFieldStaff ? 'Curator Mode' : 'Admin Operations Override'}
          </span>
        </div>

        {/* Filters Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          {/* Search Box */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-400 font-mono uppercase">Search Job</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search name, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 w-full text-xs rounded-md border border-neutral-200 outline-none bg-white focus:border-[#fbbf24] transition font-medium text-neutral-800"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-400 font-mono uppercase">Job Stage</label>
            <select
              value={statusVal}
              onChange={(e) => setStatusVal(e.target.value)}
              className="w-full p-1.5 bg-white border border-neutral-200 rounded-md outline-none font-semibold text-neutral-700 text-xs cursor-pointer focus:border-[#fbbf24] transition"
            >
              <option value="all">All Stages</option>
              <option value="Allocated">Allocated / Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="On the Way">On the Way</option>
              <option value="Started">Started</option>
              <option value="Completed">Completed</option>
              <option value="Issue Reported">Issue Reported</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-400 font-mono uppercase">Arrival Date</label>
            <div className="flex gap-1.5">
              <input
                type="date"
                value={dateVal}
                onChange={(e) => setDateVal(e.target.value)}
                className="w-full p-1 bg-white border border-neutral-200 rounded-md outline-none text-neutral-700 text-xs cursor-pointer focus:border-[#fbbf24] transition"
              />
              {dateVal && (
                <button
                  onClick={() => setDateVal('')}
                  className="p-1 px-2 border border-neutral-300 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-md text-xs font-bold transition cursor-pointer"
                  title="Clear date"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Admin staff selection selector */}
          {!isRealFieldStaff && (
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-neutral-400 font-mono uppercase">Curator Staff</label>
              <select
                value={actingStaffId}
                onChange={(e) => setActingStaffId(e.target.value)}
                className="w-full p-1.5 bg-white border border-neutral-200 rounded-md outline-none font-semibold text-neutral-700 text-xs cursor-pointer focus:border-[#fbbf24] transition"
              >
                <option value="all">All Active Staff</option>
                {staff.filter(s => String(s.role_id) === '4').map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 2. Interactive Sheet Table view */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-3xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-neutral-700">
            <thead className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="p-4">Ref ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Curation Level</th>
                <th className="p-4">Schedule Frame</th>
                <th className="p-4 text-center">Status</th>
                {!isRealFieldStaff && <th className="p-4">Assigned Curator</th>}
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredBookings.map(b => {
                const assignedStaffName = staff.find(s => String(s.id) === String(b.assigned_staff_id))?.name || 'Unassigned';

                // Status configuration
                let statusClasses = 'bg-neutral-100 text-neutral-700 border-neutral-200';
                let statusLabel = b.staff_job_status || 'Pending';

                if (b.staff_job_status === 'Accepted') {
                  statusClasses = 'bg-blue-50 text-blue-700 border-blue-100';
                } else if (b.staff_job_status === 'On the Way') {
                  statusClasses = 'bg-amber-50 text-amber-700 border-amber-100';
                } else if (b.staff_job_status === 'Started') {
                  statusClasses = 'bg-purple-50 text-purple-700 border-purple-100';
                } else if (b.staff_job_status === 'Completed') {
                  statusClasses = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                } else if (b.staff_job_status === 'Issue Reported') {
                  statusClasses = 'bg-rose-50 text-rose-700 border-rose-150 font-extrabold animate-pulse';
                }

                return (
                  <tr 
                    key={b.id}
                    onClick={() => {
                      setDrawerTab('view');
                      setSelectedBooking(b);
                    }}
                    className="hover:bg-neutral-50/50 transition cursor-pointer select-none border-b border-neutral-100 last:border-b-0"
                  >
                    <td className="p-4 font-mono font-bold text-neutral-900">{b.id}</td>
                    <td className="p-4">
                      <div className="font-semibold text-neutral-950">{b.first_name} {b.last_name}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">{b.phone}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 border text-neutral-800">
                        <Sparkles className="w-3 h-3 text-[#fbbf24]" />
                        {b.restoration_level}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-neutral-800">{b.selected_date}</div>
                      <div className="text-[10px] text-neutral-400 font-medium">{b.selected_time_slot}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusClasses}`}>
                        {statusLabel}
                      </span>
                    </td>
                    {!isRealFieldStaff && (
                      <td className="p-4 font-semibold text-neutral-700">
                        {assignedStaffName}
                      </td>
                    )}
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setDrawerTab('view');
                            setSelectedBooking(b);
                          }}
                          className="px-2.5 py-1 text-neutral-600 border border-neutral-200 hover:border-neutral-500 rounded bg-white font-bold transition cursor-pointer"
                        >
                          Details
                        </button>
                        {!isRealFieldStaff && (
                          <button
                            onClick={() => {
                              setDrawerTab('edit');
                              setSelectedBooking(b);
                            }}
                            className="px-2.5 py-1 text-black bg-[#fbbf24] hover:bg-[#fbbf24]/90 rounded font-bold transition cursor-pointer"
                            title="Modify allocation"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={isRealFieldStaff ? 6 : 7} className="p-8 text-neutral-500 italic text-center">
                    No active dispatches matched your filter queries today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
