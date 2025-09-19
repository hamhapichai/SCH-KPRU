import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { MessageSquare, Users, Building2, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { DashboardStats, RecentComplaint } from '@/types';
import { complaintApi } from '@/lib/api';

const DashboardPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [recentComplaints, setRecentComplaints] = React.useState<RecentComplaint[]>([]);
  const [loadingStats, setLoadingStats] = React.useState(true);
  const [loadingRecent, setLoadingRecent] = React.useState(true);

  // Redirect Admin to users page
  useEffect(() => {
    // Don't redirect while auth is still loading
    if (loading) return;
    
    if (user?.roleName === 'Admin') {
      router.push('/users');
    }
  }, [user, loading, router]);

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true);
      const response = await complaintApi.getDashboardStats();
      setStats(response);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Fallback to mock data if API fails
      setStats({
        totalComplaints: 0,
        pendingComplaints: 0,
        resolvedComplaints: 0,
        totalUsers: 0,
        totalDepartments: 0,
        averageResponseTimeValue: 0,
        averageResponseTimeUnit: 'ชั่วโมง',
        averageResponseTimeDisplay: '0 ชั่วโมง'
      });
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch recent complaints
  const fetchRecentComplaints = async () => {
    try {
      setLoadingRecent(true);
      const response = await complaintApi.getRecentComplaintsForDashboard(5);
      setRecentComplaints(response);
    } catch (error) {
      console.error('Error fetching recent complaints:', error);
      // Fallback to empty array if API fails
      setRecentComplaints([]);
    } finally {
      setLoadingRecent(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    if (user && user.roleName !== 'Admin') {
      fetchDashboardStats();
      fetchRecentComplaints();
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'warning';
      case 'Assigned to Department':
        return 'info';
      case 'Assigned to Committee':
        return 'info';
      case 'In Progress':
        return 'info';
      case 'Pending Deputy Dean Approval':
        return 'warning';
      case 'Pending Dean Approval':
        return 'warning';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  // Status mapping from English to Thai
  const getStatusLabel = (status: string, userRole?: string) => {
    // Special case for Deputy: show "Assigned to Department" as "รอการดำเนินการ"
    if (userRole === 'Deputy' && status === 'Assigned to Department') {
      return 'รอการดำเนินการ';
    }

    // Special case for Staff: show "Assigned to Committee" as "รอดำเนินการ"
    if (userRole === 'Staff' && status === 'Assigned to Committee') {
      return 'รอดำเนินการ';
    }

    // Special case for Deputy Dean: show "Pending Deputy Dean Approval" as "รอการพิจารณาจากฉัน"
    if (userRole === 'Deputy' && status === 'Pending Deputy Dean Approval') {
      return 'รอการพิจารณาจากฉัน';
    }

    // Special case for Dean: show "Pending Dean Approval" as "รอการพิจารณาจากฉัน"
    if (userRole === 'Dean' && status === 'Pending Dean Approval') {
      return 'รอการพิจารณาจากฉัน';
    }

    switch (status) {
      case 'New':
        return 'เรื่องใหม่';
      case 'Assigned to Department':
        return 'ส่งต่อไปยังหน่วยงานที่เกี่ยวข้องแล้ว';
      case 'Assigned to Committee':
        return 'ส่งต่อไปยังคณะกรรมการที่เกี่ยวข้องแล้ว';
      case 'In Progress':
        return 'กำลังดำเนินการ';
      case 'Pending Deputy Dean Approval':
        return 'รอการพิจารณาจากรองคณบดี';
      case 'Pending Dean Approval':
        return 'รอการพิจารณาจากคณบดี';
      case 'Completed':
        return 'ดำเนินการเสร็จสิ้น';
      case 'Cancelled':
        return 'ยกเลิก';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'New':
        return <AlertCircle className="h-4 w-4" />;
      case 'Assigned to Department':
        return <Building2 className="h-4 w-4" />;
      case 'Assigned to Committee':
        return <Users className="h-4 w-4" />;
      case 'In Progress':
        return <Clock className="h-4 w-4" />;
      case 'Pending Deputy Dean Approval':
        return <Clock className="h-4 w-4" />;
      case 'Pending Dean Approval':
        return <Clock className="h-4 w-4" />;
      case 'Completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'Cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <ProtectedRoute roles={['Dean', 'Deputy', 'Staff']}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-bold text-heading">
            สวัสดี, {String(user?.name ?? '')} {String(user?.lastname ?? '')}
          </h1>
          <p className="text-body-color">
            ยินดีต้อนรับสู่ระบบจัดการข้อร้องเรียน SCH-KPRU
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex-shrink-0">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-heading">
                  {loadingStats ? '...' : (stats?.totalComplaints ?? 0)}
                </div>
                <div className="text-sm text-body-color">ข้อร้องเรียนทั้งหมด</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-warning" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-heading">
                  {loadingStats ? '...' : (stats?.pendingComplaints ?? 0)}
                </div>
                <div className="text-sm text-body-color">รอดำเนินการ</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-heading">
                  {loadingStats ? '...' : (stats?.resolvedComplaints ?? 0)}
                </div>
                <div className="text-sm text-body-color">เสร็จสิ้น</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-info" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-heading">
                  {loadingStats ? '...' : (stats?.totalUsers ?? 0)}
                </div>
                <div className="text-sm text-body-color">ผู้ใช้ในระบบ</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex-shrink-0">
                <Building2 className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {loadingStats ? '...' : (stats?.totalDepartments ?? 0)}
                </div>
                <div className="text-sm text-gray-600">หน่วยงานทั้งหมด</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {loadingStats ? '...' : (stats?.averageResponseTimeDisplay ?? '0 ชั่วโมง')}
                </div>
                <div className="text-sm text-gray-600">เวลาตอบกลับเฉลี่ย</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Complaints */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อร้องเรียนล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingRecent ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">กำลังโหลด...</p>
                </div>
              ) : recentComplaints.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600">ไม่มีข้อร้องเรียนล่าสุด</p>
                </div>
              ) : (
                recentComplaints.map((complaint) => (
                  <div
                    key={complaint.complaintId}
                    className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0 last:pb-0 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                    onClick={() => router.push(`/complaints/${complaint.complaintId}/edit`)}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{complaint.subject}</h4>
                      <p className="text-sm text-gray-600">{complaint.departmentName || 'ไม่ระบุหน่วยงาน'}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={getStatusColor(complaint.currentStatus) as any} className="flex items-center gap-1">
                        {getStatusIcon(complaint.currentStatus)}
                        {getStatusLabel(complaint.currentStatus, user?.roleName)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(complaint.submissionDate).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;