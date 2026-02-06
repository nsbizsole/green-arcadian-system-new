// Placeholder pages for admin portal
import { Card, CardContent } from '../../components/ui/card';
import { FolderKanban, CalendarClock, Handshake, ShoppingCart, FileQuestion, FileText, Factory, MessageSquare, Settings } from 'lucide-react';

const PlaceholderPage = ({ title, icon: Icon, description }) => (
  <div className="space-y-6">
    <div><h1 className="font-ui text-2xl font-bold text-primary">{title}</h1><p className="text-primary/60 font-ui">{description}</p></div>
    <Card className="bg-white border-primary/5"><CardContent className="p-12 text-center"><Icon className="w-16 h-16 text-primary/20 mx-auto mb-4" /><p className="text-primary/60">This module is ready. Add data to see content here.</p></CardContent></Card>
  </div>
);

export const Projects = () => <PlaceholderPage title="Landscaping Projects" icon={FolderKanban} description="Manage projects, BOQ, timelines, crew logs, and client signoffs" />;
export const AMC = () => <PlaceholderPage title="AMC Subscriptions" icon={CalendarClock} description="Manage maintenance contracts, auto-scheduling, and billing" />;
export const Partners = () => <PlaceholderPage title="Sales Partners" icon={Handshake} description="Manage partner commissions, deal locks, and payouts" />;
export const Orders = () => <PlaceholderPage title="Orders" icon={ShoppingCart} description="Manage retail and wholesale orders" />;
export const RFQ = () => <PlaceholderPage title="Bulk RFQ" icon={FileQuestion} description="Handle bulk quote requests from B2B clients" />;
export const Exports = () => <PlaceholderPage title="Export Documents" icon={FileText} description="Generate packing lists, phytosanitary certificates" />;
export const Production = () => <PlaceholderPage title="Value-Added Production" icon={Factory} description="Manage terrariums, dried arrangements, gift sets" />;
export const Inquiries = () => <PlaceholderPage title="Inquiries" icon={MessageSquare} description="Manage customer inquiries and leads" />;
export const AdminSettings = () => <PlaceholderPage title="Settings" icon={Settings} description="Configure your business settings" />;
