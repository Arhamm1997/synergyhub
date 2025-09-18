import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Configure your personal and workspace settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>User profile settings, notification preferences, and workspace configurations will be available here.</p>
      </CardContent>
    </Card>
  );
}
