import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCheck, UserX, Ban, Trash2, Search, Filter } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const statusColors = { active: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800', suspended: 'bg-red-100 text-red-800', rejected: 'bg-gray-100 text-gray-800' };
const roleColors = { admin: 'bg-purple-100 text-purple-800', manager: 'bg-blue-100 text-blue-800', partner: 'bg-orange-100 text-orange-800', vendor: 'bg-cyan-100 text-cyan-800', crew: 'bg-green-100 text-green-800', customer: 'bg-gray-100 text-gray-800' };

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchUsers(); }, [statusFilter, roleFilter]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      const response = await axios.get(`${API}/admin/users?${params}`);
      setUsers(response.data);
    } catch (error) { toast.error('Failed to fetch users'); }
    finally { setLoading(false); }
  };

  const approveUser = async (userId) => {
    try {
      await axios.post(`${API}/admin/users/${userId}/approve`);
      toast.success('User approved');
      fetchUsers();
    } catch (error) { toast.error('Failed to approve'); }
  };

  const rejectUser = async (userId) => {
    if (!window.confirm('Reject this user?')) return;
    try {
      await axios.post(`${API}/admin/users/${userId}/reject`);
      toast.success('User rejected');
      fetchUsers();
    } catch (error) { toast.error('Failed to reject'); }
  };

  const suspendUser = async (userId) => {
    if (!window.confirm('Suspend this user?')) return;
    try {
      await axios.post(`${API}/admin/users/${userId}/suspend`);
      toast.success('User suspended');
      fetchUsers();
    } catch (error) { toast.error('Failed to suspend'); }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await axios.delete(`${API}/admin/users/${userId}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (error) { toast.error(error.response?.data?.detail || 'Failed to delete'); }
  };

  const changeRole = async (userId, newRole) => {
    try {
      await axios.put(`${API}/admin/users/${userId}`, { role: newRole });
      toast.success('Role updated');
      fetchUsers();
    } catch (error) { toast.error('Failed to update role'); }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="users-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-ui text-2xl font-bold text-primary">User Management</h1>
          <p className="text-primary/60 font-ui">Manage all user accounts and permissions</p>
        </div>
        {users.filter(u => u.status === 'pending').length > 0 && (
          <Badge className="bg-terracotta text-white">{users.filter(u => u.status === 'pending').length} Pending Approval</Badge>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-white border-primary/10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-white border-primary/10"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40 bg-white border-primary/10"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="partner">Partner</SelectItem>
            <SelectItem value="vendor">Vendor</SelectItem>
            <SelectItem value="crew">Crew</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white border border-primary/5 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-primary/10">
              <TableHead className="text-primary/60 font-ui">User</TableHead>
              <TableHead className="text-primary/60 font-ui">Contact</TableHead>
              <TableHead className="text-primary/60 font-ui">Role</TableHead>
              <TableHead className="text-primary/60 font-ui">Status</TableHead>
              <TableHead className="text-primary/60 font-ui">Joined</TableHead>
              <TableHead className="text-primary/60 font-ui text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" /></TableCell></TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-primary/60">No users found</TableCell></TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-primary/10">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                        <span className="text-primary font-bold">{user.full_name?.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-primary">{user.full_name}</p>
                        {user.company && <p className="text-xs text-primary/60">{user.company}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-primary text-sm">{user.email}</p>
                    {user.phone && <p className="text-xs text-primary/60">{user.phone}</p>}
                  </TableCell>
                  <TableCell>
                    <Select value={user.role} onValueChange={(v) => changeRole(user.id, v)}>
                      <SelectTrigger className={`w-28 ${roleColors[user.role]}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="partner">Partner</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                        <SelectItem value="crew">Crew</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell><Badge className={statusColors[user.status]}>{user.status}</Badge></TableCell>
                  <TableCell className="text-primary/60 text-sm">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {user.status === 'pending' && (
                        <>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => approveUser(user.id)} title="Approve">
                            <UserCheck className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => rejectUser(user.id)} title="Reject">
                            <UserX className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {user.status === 'active' && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50" onClick={() => suspendUser(user.id)} title="Suspend">
                          <Ban className="w-4 h-4" />
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => deleteUser(user.id)} title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Users;
