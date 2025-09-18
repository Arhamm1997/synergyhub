import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClientsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Clients</CardTitle>
        <CardDescription>Manage all your client relationships and projects.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>A client portal and management interface will be developed here, providing access to project status and communication channels.</p>
      </CardContent>
    </Card>
  );
}
