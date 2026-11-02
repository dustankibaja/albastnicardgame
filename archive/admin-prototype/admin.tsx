import { createFileRoute, redirect, useNavigate, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  checkAdminStatus, 
  getTournament, 
  updateTournament, 
  getWinners, 
  deleteWinner, 
  getSignups, 
  logoutAdmin,
  addWinner
} from "@/api/api";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const status = await checkAdminStatus();
    if (!status.isAdmin) {
      throw redirect({ to: "/auth" });
    }
  },
  component: AdminPage,
});

function AdminPage() {
  const router = useRouter();
  
  const handleLogout = async () => {
    await logoutAdmin();
    router.invalidate();
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage Albastini Game Hub data</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>Log out</Button>
        </div>

        <Tabs defaultValue="tournament" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tournament">Tournament</TabsTrigger>
            <TabsTrigger value="winners">Winners</TabsTrigger>
            <TabsTrigger value="signups">Card Signups</TabsTrigger>
          </TabsList>

          <TabsContent value="tournament">
            <TournamentTab />
          </TabsContent>
          <TabsContent value="winners">
            <WinnersTab />
          </TabsContent>
          <TabsContent value="signups">
            <SignupsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function TournamentTab() {
  const { data: tournament, isLoading } = useQuery({
    queryKey: ["tournament"],
    queryFn: () => getTournament(),
  });
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (data: any) => updateTournament({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournament"] });
      alert("Tournament updated!");
    }
  });

  const [formData, setFormData] = useState({
    name: "",
    startsAt: "",
    venue: "",
    prizePool: "",
    format: "",
  });

  // sync when loaded
  if (tournament && !formData.name && !isLoading) {
    setFormData({
      name: tournament.name,
      startsAt: tournament.startsAt,
      venue: tournament.venue || "",
      prizePool: tournament.prizePool || "",
      format: tournament.format || "",
    });
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tournament Settings</CardTitle>
        <CardDescription>Update the upcoming tournament details.</CardDescription>
      </CardHeader>
      <CardContent>
        <form 
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(formData);
          }}
        >
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          <div className="grid gap-2">
            <Label>Starts At (ISO Date)</Label>
            <Input 
              value={formData.startsAt} 
              onChange={e => setFormData({...formData, startsAt: e.target.value})} 
              placeholder="2026-08-27T15:00:00+03:00"
            />
          </div>
          <div className="grid gap-2">
            <Label>Prize Pool</Label>
            <Input 
              value={formData.prizePool} 
              onChange={e => setFormData({...formData, prizePool: e.target.value})} 
            />
          </div>
          <div className="grid gap-2">
            <Label>Venue</Label>
            <Input 
              value={formData.venue} 
              onChange={e => setFormData({...formData, venue: e.target.value})} 
            />
          </div>
          <div className="grid gap-2">
            <Label>Format</Label>
            <Input 
              value={formData.format} 
              onChange={e => setFormData({...formData, format: e.target.value})} 
            />
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function WinnersTab() {
  const { data: winners, isLoading } = useQuery({
    queryKey: ["winners"],
    queryFn: () => getWinners(),
  });
  const queryClient = useQueryClient();
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWinner({ data: id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["winners"] }),
  });

  const [adding, setAdding] = useState(false);
  const addMutation = useMutation({
    mutationFn: (data: any) => addWinner({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["winners"] });
      setAdding(false);
    }
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tournament Winners</CardTitle>
          <CardDescription>Manage the hall of fame winners.</CardDescription>
        </div>
        <Button onClick={() => setAdding(!adding)}>
          {adding ? "Cancel" : "Add Winner"}
        </Button>
      </CardHeader>
      <CardContent>
        {adding && (
          <form 
            className="mb-8 space-y-4 rounded-md border p-4"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addMutation.mutate({
                name: formData.get("name") as string,
                tournament: formData.get("tournament") as string,
                date: formData.get("date") as string,
                year: parseInt(formData.get("year") as string),
                position: parseInt(formData.get("position") as string),
                prize: formData.get("prize") as string,
                city: formData.get("city") as string,
                image: "/assets/winner-1.jpg" // mock placeholder
              });
            }}
          >
            <h3 className="font-semibold text-lg mb-2">New Winner</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Name</Label><Input name="name" required /></div>
              <div><Label>Tournament</Label><Input name="tournament" required defaultValue="Albastini Tournament" /></div>
              <div><Label>Date String (e.g. June 2026)</Label><Input name="date" required /></div>
              <div><Label>Year (e.g. 2026)</Label><Input name="year" type="number" required /></div>
              <div><Label>Position</Label><Input name="position" type="number" required defaultValue="1" /></div>
              <div><Label>Prize (e.g. TSh 2,000,000)</Label><Input name="prize" /></div>
              <div><Label>City</Label><Input name="city" /></div>
            </div>
            <Button type="submit" disabled={addMutation.isPending}>Add</Button>
          </form>
        )}
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Year</TableHead>
              <TableHead>Tournament</TableHead>
              <TableHead>Pos</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Prize</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {winners?.sort((a,b) => b.year - a.year || a.position - b.position).map(w => (
              <TableRow key={w.id}>
                <TableCell>{w.year}</TableCell>
                <TableCell>{w.tournament}</TableCell>
                <TableCell>{w.position}</TableCell>
                <TableCell>{w.name}</TableCell>
                <TableCell>{w.prize}</TableCell>
                <TableCell>
                  <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(w.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function SignupsTab() {
  const { data: signups, isLoading } = useQuery({
    queryKey: ["signups"],
    queryFn: () => getSignups(),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Signups</CardTitle>
        <CardDescription>People waiting for physical cards.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {signups?.map((s, i) => (
              <TableRow key={i}>
                <TableCell>{s.email}</TableCell>
                <TableCell>{new Date(s.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {signups?.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center">No signups yet</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
