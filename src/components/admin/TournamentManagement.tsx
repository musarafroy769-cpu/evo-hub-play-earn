import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Upload, Radio, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Tournament {
  id: string;
  title: string;
  game_type: string;
  mode: string;
  entry_fee: number;
  prize_pool: number;
  total_slots: number;
  filled_slots: number;
  scheduled_at: string;
  status: string;
  image_url: string | null;
  room_id: string | null;
  room_password: string | null;
}

interface TournamentManagementProps {
  tournaments: Tournament[];
  onRefresh: () => void;
}

export const TournamentManagement = ({ tournaments, onRefresh }: TournamentManagementProps) => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    game_type: "FF",
    mode: "Solo",
    entry_fee: "0",
    prize_pool: "0",
    total_slots: "100",
    scheduled_at: "",
  });
  const [resultData, setResultData] = useState({
    winner_notes: "",
  });
  const [roomData, setRoomData] = useState({
    room_id: "",
    room_password: "",
  });

  const openCreateDialog = () => {
    setEditMode(false);
    setFormData({
      title: "",
      game_type: "FF",
      mode: "Solo",
      entry_fee: "0",
      prize_pool: "0",
      total_slots: "100",
      scheduled_at: "",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (tournament: Tournament) => {
    setEditMode(true);
    setSelectedTournament(tournament);
    setFormData({
      title: tournament.title,
      game_type: tournament.game_type,
      mode: tournament.mode,
      entry_fee: tournament.entry_fee.toString(),
      prize_pool: tournament.prize_pool.toString(),
      total_slots: tournament.total_slots.toString(),
      scheduled_at: new Date(tournament.scheduled_at).toISOString().slice(0, 16),
    });
    setDialogOpen(true);
  };

  const openResultsDialog = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setResultData({ winner_notes: "" });
    setResultsDialogOpen(true);
  };

  const openDeleteDialog = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setDeleteDialogOpen(true);
  };

  const openRoomDialog = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setRoomData({
      room_id: tournament.room_id || "",
      room_password: tournament.room_password || "",
    });
    setRoomDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.scheduled_at) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const tournamentData = {
      title: formData.title,
      game_type: formData.game_type,
      mode: formData.mode,
      entry_fee: Number(formData.entry_fee),
      prize_pool: Number(formData.prize_pool),
      total_slots: Number(formData.total_slots),
      scheduled_at: new Date(formData.scheduled_at).toISOString(),
      status: 'upcoming',
    };

    if (editMode && selectedTournament) {
      const { error } = await supabase
        .from('tournaments')
        .update(tournamentData)
        .eq('id', selectedTournament.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update tournament",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Tournament updated successfully",
        });
        setDialogOpen(false);
        onRefresh();
      }
    } else {
      const { error } = await supabase
        .from('tournaments')
        .insert(tournamentData);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create tournament",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Tournament created successfully",
        });
        setDialogOpen(false);
        onRefresh();
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedTournament) return;

    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', selectedTournament.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete tournament",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Tournament deleted successfully",
      });
      setDeleteDialogOpen(false);
      onRefresh();
    }
  };

  const handleUploadResults = async () => {
    if (!selectedTournament) return;

    const { error } = await supabase
      .from('tournaments')
      .update({
        status: 'completed',
      })
      .eq('id', selectedTournament.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to upload results",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Results uploaded successfully",
      });
      setResultsDialogOpen(false);
      onRefresh();
    }
  };

  const handleSaveRoomDetails = async () => {
    if (!selectedTournament) return;

    if (!roomData.room_id.trim() || !roomData.room_password.trim()) {
      toast({
        title: "Missing Details",
        description: "Please fill in both Room ID and Password",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('tournaments')
      .update({
        room_id: roomData.room_id.trim(),
        room_password: roomData.room_password.trim(),
        status: 'live',
      })
      .eq('id', selectedTournament.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update room details",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Tournament is Live!",
        description: "Room details saved and tournament is now live",
      });
      setRoomDialogOpen(false);
      onRefresh();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      upcoming: "bg-blue-500/20 text-blue-500 border-blue-500/30",
      live: "bg-green-500/20 text-green-500 border-green-500/30 animate-pulse",
      ongoing: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
      completed: "bg-gray-500/20 text-gray-500 border-gray-500/30",
    };

    return (
      <Badge className={variants[status] || variants.upcoming}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <>
      <Card className="glass border-border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Tournament Management</h2>
          <Button onClick={openCreateDialog} className="bg-gradient-gaming">
            <Plus className="w-4 h-4 mr-2" />
            Create Tournament
          </Button>
        </div>
        
        {tournaments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No tournaments found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Game</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Entry Fee</TableHead>
                  <TableHead>Prize Pool</TableHead>
                  <TableHead>Slots</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tournaments.map((tournament) => (
                  <TableRow key={tournament.id}>
                    <TableCell className="font-medium">{tournament.title}</TableCell>
                    <TableCell>{tournament.game_type}</TableCell>
                    <TableCell>{tournament.mode}</TableCell>
                    <TableCell className="text-primary">₹{tournament.entry_fee}</TableCell>
                    <TableCell className="font-bold">₹{tournament.prize_pool}</TableCell>
                    <TableCell>
                      {tournament.filled_slots}/{tournament.total_slots}
                    </TableCell>
                    <TableCell>{getStatusBadge(tournament.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(tournament)}
                          title="Edit Tournament"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {tournament.status === 'upcoming' && (
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => openRoomDialog(tournament)}
                            title="Add Room & Go Live"
                          >
                            <Radio className="w-4 h-4" />
                          </Button>
                        )}
                        {(tournament.status === 'live' || tournament.status === 'ongoing') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openResultsDialog(tournament)}
                            title="Upload Results"
                          >
                            <Upload className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openDeleteDialog(tournament)}
                          title="Delete Tournament"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editMode ? "Edit" : "Create"} Tournament</DialogTitle>
            <DialogDescription>
              {editMode ? "Update tournament details" : "Fill in the tournament details"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tournament Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., FF Championship 2024"
                className="glass border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="game_type">Game Type *</Label>
                <Select
                  value={formData.game_type}
                  onValueChange={(value) => setFormData({ ...formData, game_type: value })}
                >
                  <SelectTrigger className="glass border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FF">Free Fire</SelectItem>
                    <SelectItem value="BGMI">BGMI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mode">Mode *</Label>
                <Select
                  value={formData.mode}
                  onValueChange={(value) => setFormData({ ...formData, mode: value })}
                >
                  <SelectTrigger className="glass border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solo">Solo</SelectItem>
                    <SelectItem value="Duo">Duo</SelectItem>
                    <SelectItem value="Squad">Squad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entry_fee">Entry Fee (₹) *</Label>
                <Input
                  id="entry_fee"
                  type="number"
                  value={formData.entry_fee}
                  onChange={(e) => setFormData({ ...formData, entry_fee: e.target.value })}
                  className="glass border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prize_pool">Prize Pool (₹) *</Label>
                <Input
                  id="prize_pool"
                  type="number"
                  value={formData.prize_pool}
                  onChange={(e) => setFormData({ ...formData, prize_pool: e.target.value })}
                  className="glass border-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_slots">Total Slots *</Label>
                <Input
                  id="total_slots"
                  type="number"
                  value={formData.total_slots}
                  onChange={(e) => setFormData({ ...formData, total_slots: e.target.value })}
                  className="glass border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduled_at">Scheduled Date & Time *</Label>
                <Input
                  id="scheduled_at"
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  className="glass border-border"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-gradient-gaming">
              {editMode ? "Update" : "Create"} Tournament
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Results Upload Dialog */}
      <Dialog open={resultsDialogOpen} onOpenChange={setResultsDialogOpen}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle>Upload Match Results</DialogTitle>
            <DialogDescription>
              Mark this tournament as completed and record the results
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium mb-1">{selectedTournament?.title}</p>
              <p className="text-xs text-muted-foreground">
                {selectedTournament?.game_type} • {selectedTournament?.mode}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="winner_notes">Winner & Results Notes</Label>
              <Textarea
                id="winner_notes"
                placeholder="Enter winner details, kills, placement info..."
                value={resultData.winner_notes}
                onChange={(e) => setResultData({ winner_notes: e.target.value })}
                className="glass border-border"
                rows={4}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Note: This will mark the tournament as completed
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setResultsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadResults} className="bg-green-600 hover:bg-green-700">
              Upload Results
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Room Details & Go Live Dialog */}
      <Dialog open={roomDialogOpen} onOpenChange={setRoomDialogOpen}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-green-500" />
              Add Room Details & Go Live
            </DialogTitle>
            <DialogDescription>
              Enter the room ID and password. This will make the tournament live.
            </DialogDescription>
          </DialogHeader>

          {selectedTournament && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                <p className="text-sm font-medium">{selectedTournament.title}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedTournament.game_type} • {selectedTournament.mode}
                </p>
                <p className="text-xs text-muted-foreground">
                  Players: {selectedTournament.filled_slots}/{selectedTournament.total_slots}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="room_id" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Room ID *
                </Label>
                <Input
                  id="room_id"
                  placeholder="Enter room/lobby ID"
                  value={roomData.room_id}
                  onChange={(e) => setRoomData({ ...roomData, room_id: e.target.value })}
                  className="glass border-border font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="room_password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Room Password *
                </Label>
                <Input
                  id="room_password"
                  placeholder="Enter room/lobby password"
                  value={roomData.room_password}
                  onChange={(e) => setRoomData({ ...roomData, room_password: e.target.value })}
                  className="glass border-border font-mono"
                />
              </div>

              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-xs text-green-500">
                  ⚡ After saving, the tournament will be marked as <strong>LIVE</strong> and players will see the room details.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setRoomDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveRoomDetails} 
              className="bg-green-600 hover:bg-green-700"
            >
              <Radio className="w-4 h-4 mr-2" />
              Save & Go Live
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle>Delete Tournament</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this tournament? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedTournament && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium">{selectedTournament.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedTournament.game_type} • {selectedTournament.mode}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Tournament
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
