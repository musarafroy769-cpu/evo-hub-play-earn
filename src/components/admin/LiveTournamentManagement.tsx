import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, Users, AlertCircle, Plus, Trash2 } from "lucide-react";
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
  per_kill_prize: number;
  position_prizes: any[];
}

interface LiveTournamentManagementProps {
  tournaments: Tournament[];
  onRefresh: () => void;
}

interface Participant {
  user_id: string;
  username: string;
  game_uid: string | null;
}

interface WinnerEntry {
  user_id: string;
  username: string;
  position: number;
  kills: number;
  prize_amount: number;
}

export const LiveTournamentManagement = ({ 
  tournaments, 
  onRefresh 
}: LiveTournamentManagementProps) => {
  const { toast } = useToast();
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winners, setWinners] = useState<WinnerEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const openResultsDialog = async (tournament: Tournament) => {
    setSelectedTournament(tournament);
    await fetchParticipants(tournament.id);
    setShowResultsDialog(true);
  };

  const fetchParticipants = async (tournamentId: string) => {
    try {
      const { data: participantData, error } = await supabase
        .from('tournament_participants')
        .select('user_id')
        .eq('tournament_id', tournamentId);

      if (error) throw error;

      if (participantData && participantData.length > 0) {
        const userIds = participantData.map(p => p.user_id);

        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, game_uid')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        const formattedParticipants = profilesData?.map(p => ({
          user_id: p.id,
          username: p.username,
          game_uid: p.game_uid
        })) || [];

        setParticipants(formattedParticipants);
      } else {
        setParticipants([]);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast({
        title: "Error",
        description: "Failed to load participants",
        variant: "destructive",
      });
    }
  };

  const addWinner = () => {
    if (participants.length === 0) {
      toast({
        title: "No Participants",
        description: "No participants found for this tournament",
        variant: "destructive",
      });
      return;
    }

    setWinners([...winners, {
      user_id: '',
      username: '',
      position: winners.length + 1,
      kills: 0,
      prize_amount: 0
    }]);
  };

  const removeWinner = (index: number) => {
    const newWinners = winners.filter((_, i) => i !== index);
    setWinners(newWinners.map((w, i) => ({ ...w, position: i + 1 })));
  };

  const updateWinner = (index: number, field: keyof WinnerEntry, value: string | number) => {
    const newWinners = [...winners];
    if (field === 'user_id' && typeof value === 'string') {
      const participant = participants.find(p => p.user_id === value);
      newWinners[index].username = participant?.username || '';
      newWinners[index].user_id = value;
    } else if (field === 'username' && typeof value === 'string') {
      newWinners[index].username = value;
    } else if (field === 'position' && typeof value === 'number') {
      newWinners[index].position = value;
    } else if (field === 'kills' && typeof value === 'number') {
      newWinners[index].kills = value;
    } else if (field === 'prize_amount' && typeof value === 'number') {
      newWinners[index].prize_amount = value;
    }
    setWinners(newWinners);
  };

  const calculatePrizes = () => {
    if (!selectedTournament) return;

    const newWinners = winners.map(winner => {
      let prizeAmount = 0;
      
      if (selectedTournament.position_prizes && selectedTournament.position_prizes.length > 0) {
        const positionPrize = selectedTournament.position_prizes.find(
          (p: any) => p.position === winner.position
        );
        if (positionPrize) {
          prizeAmount += parseFloat(positionPrize.amount || 0);
        }
      }
      
      prizeAmount += winner.kills * selectedTournament.per_kill_prize;
      
      return { ...winner, prize_amount: prizeAmount };
    });

    setWinners(newWinners);
    
    const totalPrizes = newWinners.reduce((sum, w) => sum + w.prize_amount, 0);
    
    toast({
      title: "Prizes Calculated",
      description: `Total: ₹${totalPrizes.toFixed(2)} (Pool: ₹${selectedTournament.prize_pool})`,
    });
  };

  const getTotalPrizes = () => {
    return winners.reduce((sum, w) => sum + w.prize_amount, 0);
  };

  const validateAndShowConfirmation = () => {
    if (!selectedTournament) return;

    if (winners.length === 0) {
      toast({
        title: "No Winners",
        description: "Please add at least one winner",
        variant: "destructive",
      });
      return;
    }

    if (winners.some(w => !w.user_id)) {
      toast({
        title: "Incomplete Data",
        description: "Please select a player for all winner positions",
        variant: "destructive",
      });
      return;
    }

    const totalPrizes = getTotalPrizes();
    if (totalPrizes > selectedTournament.prize_pool) {
      toast({
        title: "Prize Pool Exceeded",
        description: `Total prizes (₹${totalPrizes}) exceed prize pool (₹${selectedTournament.prize_pool})`,
        variant: "destructive",
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleCompleteResults = async () => {
    if (!selectedTournament) return;

    setShowConfirmDialog(false);
    setIsProcessing(true);

    try {
      const resultsToInsert = winners.map(w => ({
        tournament_id: selectedTournament.id,
        user_id: w.user_id,
        position: w.position,
        kills: w.kills,
        prize_amount: w.prize_amount
      }));

      const { error: resultsError } = await supabase
        .from('tournament_results')
        .insert(resultsToInsert);

      if (resultsError) throw resultsError;

      for (const winner of winners) {
        if (winner.prize_amount > 0) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('wallet_balance')
            .eq('id', winner.user_id)
            .single();

          if (profileError) throw profileError;

          const newBalance = (profile.wallet_balance || 0) + winner.prize_amount;

          const { error: updateError } = await supabase
            .from('profiles')
            .update({ wallet_balance: newBalance })
            .eq('id', winner.user_id);

          if (updateError) throw updateError;
        }
      }

      const { error: statusError } = await supabase
        .from('tournaments')
        .update({ status: 'completed' })
        .eq('id', selectedTournament.id);

      if (statusError) throw statusError;

      const totalDistributed = winners.reduce((sum, w) => sum + w.prize_amount, 0);
      
      toast({
        title: "Tournament Completed! 🎉",
        description: `₹${totalDistributed.toFixed(2)} distributed to ${winners.length} winners`,
      });

      setShowResultsDialog(false);
      setWinners([]);
      setSelectedTournament(null);
      onRefresh();
    } catch (error: any) {
      console.error('Error completing tournament:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete tournament",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const stopTournament = async (tournamentId: string) => {
    try {
      const { error } = await supabase
        .from('tournaments')
        .update({ status: 'completed' })
        .eq('id', tournamentId);

      if (error) throw error;

      toast({
        title: "Tournament Stopped",
        description: "Tournament has been marked as completed",
      });

      onRefresh();
    } catch (error) {
      console.error('Error stopping tournament:', error);
      toast({
        title: "Error",
        description: "Failed to stop tournament",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="glass border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Live Tournaments</h2>
          </div>
          <Badge variant="secondary" className="glass">
            {tournaments.length} Active
          </Badge>
        </div>

        {tournaments.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No live tournaments at the moment</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tournament</TableHead>
                <TableHead>Game</TableHead>
                <TableHead>Players</TableHead>
                <TableHead>Prize Pool</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tournaments.map((tournament) => (
                <TableRow key={tournament.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold">{tournament.title}</p>
                      <p className="text-xs text-muted-foreground">{tournament.mode}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{tournament.game_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{tournament.filled_slots}/{tournament.total_slots}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-primary">₹{tournament.prize_pool}</span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      onClick={() => openResultsDialog(tournament)}
                      className="bg-gradient-gaming"
                    >
                      Add Results
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => stopTournament(tournament.id)}
                    >
                      Stop
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Add Tournament Results - {selectedTournament?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                <p>Per Kill Prize: ₹{selectedTournament?.per_kill_prize}</p>
                <p>Total Participants: {participants.length}</p>
              </div>
              <Button onClick={addWinner} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Winner
              </Button>
            </div>

            {winners.length > 0 && (
              <div className="space-y-3">
                {winners.map((winner, index) => (
                  <Card key={index} className="glass p-4">
                    <div className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-1">
                        <Label className="text-xs">Pos</Label>
                        <Input
                          type="number"
                          value={winner.position}
                          disabled
                          className="glass"
                        />
                      </div>
                      <div className="col-span-4">
                        <Label className="text-xs">Player (UID)</Label>
                        <select
                          className="w-full h-10 px-3 rounded-md glass border-border bg-background text-foreground text-sm"
                          value={winner.user_id}
                          onChange={(e) => updateWinner(index, 'user_id', e.target.value)}
                        >
                          <option value="">Select Player</option>
                          {participants.map((p) => (
                            <option key={p.user_id} value={p.user_id}>
                              {p.username} {p.game_uid ? `(UID: ${p.game_uid})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Kills</Label>
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={winner.kills.toString()}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            updateWinner(index, 'kills', parseInt(val) || 0);
                          }}
                          className="glass"
                        />
                      </div>
                      <div className="col-span-3">
                        <Label className="text-xs">Prize Amount (₹)</Label>
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={winner.prize_amount.toString()}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, '');
                            updateWinner(index, 'prize_amount', parseFloat(val) || 0);
                          }}
                          className="glass"
                        />
                      </div>
                      <div className="col-span-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeWinner(index)}
                          className="w-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                <Button
                  onClick={calculatePrizes}
                  variant="outline"
                  className="w-full"
                >
                  Calculate Prizes (Position + Kills)
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex-1 text-left">
              {winners.length > 0 && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Total Distribution:</p>
                  <p className="text-lg font-bold text-primary">₹{getTotalPrizes().toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    Pool: ₹{selectedTournament?.prize_pool}
                  </p>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setShowResultsDialog(false);
                setWinners([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={validateAndShowConfirmation}
              disabled={isProcessing || winners.length === 0}
              className="bg-gradient-gaming"
            >
              Complete & Distribute Prizes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Prize Distribution</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="glass p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Distribution Summary</h3>
              <div className="space-y-2">
                {winners.map((winner, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{winner.username} (Pos {winner.position})</span>
                    <span className="font-semibold text-primary">₹{winner.prize_amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-3 pt-3">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{getTotalPrizes().toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              This will add prizes to winners' wallets and mark the tournament as completed. This action cannot be undone.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompleteResults} disabled={isProcessing} className="bg-gradient-gaming">
              {isProcessing ? "Processing..." : "Confirm & Distribute"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};