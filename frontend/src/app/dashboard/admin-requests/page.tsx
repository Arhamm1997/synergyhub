"use client";

import { useEffect, useState } from "react";
import {
  Check,
  X,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { api, API_ENDPOINTS } from "@/lib/api-config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdminRequest {
  _id: string;
  name: string;
  email: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: string;
  processedAt?: string;
  processedBy?: {
    name: string;
    email: string;
  };
  reason?: string;
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<AdminRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH.ADMIN_REQUESTS);
      setRequests(response.data.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch admin requests",
        variant: "destructive",
      });
    }
  };

  const handleProcess = async (requestId: string, status: 'Approved' | 'Rejected', reason?: string) => {
    setIsProcessing(true);
    try {
      await api.post(`${API_ENDPOINTS.AUTH.ADMIN_REQUESTS}/${requestId}`, {
        status,
        reason
      });

      toast({
        title: `Request ${status}`,
        description: `The admin request has been ${status.toLowerCase()}.`,
      });

      fetchRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || `Failed to ${status.toLowerCase()} request`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setShowRejectDialog(false);
      setRejectReason("");
    }
  };

  const getStatusIcon = (status: AdminRequest['status']) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'Approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Requests</h1>
        <p className="text-muted-foreground">
          Manage requests from users who want to join as administrators
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {requests.map((request) => (
          <Card key={request._id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>{request.name}</CardTitle>
                {getStatusIcon(request.status)}
              </div>
              <CardDescription>{request.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Requested {formatDistanceToNow(new Date(request.requestedAt), { addSuffix: true })}
                </div>
                {request.processedAt && (
                  <div className="text-sm text-muted-foreground">
                    Processed {formatDistanceToNow(new Date(request.processedAt), { addSuffix: true })}
                    {request.processedBy && ` by ${request.processedBy.name}`}
                  </div>
                )}
                {request.reason && (
                  <div className="mt-2 text-sm">
                    Reason: {request.reason}
                  </div>
                )}
                {request.status === 'Pending' && (
                  <div className="mt-4 space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleProcess(request._id, 'Approved')}
                      disabled={isProcessing}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowRejectDialog(true);
                      }}
                      disabled={isProcessing}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {requests.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <UserPlus className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                No pending admin requests
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Admin Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this admin request.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                placeholder="Enter reason for rejection"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedRequest && handleProcess(selectedRequest._id, 'Rejected', rejectReason)}
              disabled={!rejectReason.trim() || isProcessing}
            >
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}