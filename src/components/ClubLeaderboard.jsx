import { Trophy, Star, Zap, Heart } from 'lucide-react';
import './ClubLeaderboard.css';

export default function ClubLeaderboard({ members = [] }) {
  const getBadges = (member) => {
    const badges = [];
    if (member.reviewsCount >= 10) badges.push({ type: 'critic', icon: Star, label: 'Critic' });
    if (member.watchPartyCount >= 5) badges.push({ type: 'social', icon: Heart, label: 'Social Butterfly' });
    if (member.votesCount >= 20) badges.push({ type: 'active', icon: Zap, label: 'Most Active' });
    if (member.role === 'admin') badges.push({ type: 'admin', icon: Trophy, label: 'Club Admin' });
    return badges;
  };

  const rankedMembers = [...members]
    .sort((a, b) => {
      const aScore = (a.reviewsCount || 0) + (a.watchPartyCount || 0) * 2 + (a.votesCount || 0) * 0.5;
      const bScore = (b.reviewsCount || 0) + (b.watchPartyCount || 0) * 2 + (b.votesCount || 0) * 0.5;
      return bScore - aScore;
    })
    .slice(0, 10);

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h3><Trophy size={20} /> Top Members</h3>
        <span className="leaderboard-subtitle">This month's most active</span>
      </div>

      <div className="leaderboard-list">
        {rankedMembers.length === 0 ? (
          <div className="leaderboard-empty">
            <Trophy size={32} />
            <p>No members yet</p>
          </div>
        ) : (
          rankedMembers.map((member, index) => {
            const badges = getBadges(member);
            const score = (member.reviewsCount || 0) + (member.watchPartyCount || 0) * 2 + (member.votesCount || 0) * 0.5;
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;

            return (
              <div key={member.userId} className="leaderboard-item glass-panel">
                <div className="rank-badge">{medal}</div>
                
                <div className="member-info">
                  <div className="member-avatar">{member.userName ? member.userName[0] : 'U'}</div>
                  <div className="member-details">
                    <h4>{member.userName}</h4>
                    <div className="member-stats">
                      <span className="stat">📽️ {member.watchPartyCount || 0} parties</span>
                      <span className="stat">⭐ {member.reviewsCount || 0} reviews</span>
                      <span className="stat">🗳️ {member.votesCount || 0} votes</span>
                    </div>
                  </div>
                </div>

                <div className="member-badges">
                  {badges.map((badge, idx) => {
                    const IconComponent = badge.icon;
                    return (
                      <div key={idx} className={`badge badge-${badge.type}`} title={badge.label}>
                        <IconComponent size={14} />
                      </div>
                    );
                  })}
                </div>

                <div className="member-score">
                  <span className="score-label">Score</span>
                  <span className="score-value">{Math.round(score)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
