import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, Heart, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-extrabold text-lg">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
                <Search className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span>Campus<span className="text-indigo-400">Track</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The official centralized platform for lost and found items on campus. Helping students, faculty, and security reunite with their belongings quickly and safely.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Portal Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/items" className="hover:text-white transition-colors">Browse All Listings</Link>
              </li>
              <li>
                <Link to="/items?type=LOST" className="hover:text-white transition-colors">Lost Items Desk</Link>
              </li>
              <li>
                <Link to="/items?type=FOUND" className="hover:text-white transition-colors">Found Items Desk</Link>
              </li>
              <li>
                <Link to="/create" className="hover:text-white transition-colors">File an Application</Link>
              </li>
            </ul>
          </div>

          {/* Campus Guidelines */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Lost & Found Policy</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• Always verify ownership with specific details</li>
              <li>• Unclaimed items held for 60 days at Security</li>
              <li>• Report suspicious or valuable items directly</li>
              <li>• Keep student ID cards handy for verification</li>
            </ul>
          </div>

          {/* Campus Security Office */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Campus Security Helpdesk</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>Security Main Office, Admin Block Gate #1</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+91 98765 00001 (Internal Ext: 201)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>security@college.edu</span>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} CampusTrack. College Academic Capstone Project.</p>
          <p className="flex items-center gap-1">
            Built with React, Express, Prisma & SQLite
          </p>
        </div>
      </div>
    </footer>
  );
}
