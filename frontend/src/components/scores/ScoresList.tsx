import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import axios from '@/services/axiosInstance';

type Match = {
  id: number;
  game_name: string;
  player1_username: string;
  player2_username: string;
  player1_score: number;
  player2_score: number;
  winner_username: string;
  created_at: string;
};

const ScoresList = () => {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axios.get("/games/matches/");
        setMatches(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMatches();
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Game</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Players</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((match) => (
              <TableRow key={match.id}>
                <TableCell className="font-medium">{match.game_name}</TableCell>
                <TableCell>{formatDistanceToNow(new Date(match.created_at))} ago</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {[match.player1_username, match.player2_username].map((player, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className={player === match.winner_username ? "text-scoresync-blue font-medium" : ""}>
                          {player}
                        </span>
                        {player === match.winner_username && (
                          <span className="text-xs bg-scoresync-blue/10 text-scoresync-blue px-2 py-0.5 rounded">
                            Winner
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {[match.player1_score, match.player2_score].map((score, idx) => (
                      <div key={idx}>
                        {score}
                      </div>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#" isActive>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default ScoresList;
