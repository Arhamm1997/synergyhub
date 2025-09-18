import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MessagesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages</CardTitle>
        <CardDescription>Communicate with your team and clients in real-time.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>A real-time communication and chat interface will be built here, featuring group channels and direct messaging.</p>
      </CardContent>
    </Card>
  );
}
