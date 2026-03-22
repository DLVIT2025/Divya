import { useState } from 'react';
import { Users, Plus, X, DollarSign } from 'lucide-react';
import './SplitPayment.css';

export default function SplitPayment({ total, onSplit, members = [] }) {
  const [showSplitUI, setShowSplitUI] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [customAmounts, setCustomAmounts] = useState({});

  const handleAddMember = (member) => {
    if (!selectedMembers.find(m => m === member)) {
      setSelectedMembers([...selectedMembers, member]);
      setCustomAmounts(prev => ({
        ...prev,
        [member]: (total / (selectedMembers.length + 1)).toFixed(2)
      }));
    }
  };

  const handleRemoveMember = (member) => {
    setSelectedMembers(selectedMembers.filter(m => m !== member));
    const newCustomAmounts = { ...customAmounts };
    delete newCustomAmounts[member];
    setCustomAmounts(newCustomAmounts);
  };

  const handleAmountChange = (member, amount) => {
    setCustomAmounts(prev => ({
      ...prev,
      [member]: amount
    }));
  };

  const handleEqualSplit = () => {
    if (selectedMembers.length === 0) {
      alert('Please select at least one friend to split with');
      return;
    }
    const splitAmount = (total / (selectedMembers.length + 1)).toFixed(2);
    const split = {
      yourShare: splitAmount,
      splits: selectedMembers.map(member => ({
        member,
        amount: splitAmount
      }))
    };
    onSplit(split);
    setShowSplitUI(false);
  };

  const handleCustomSplit = () => {
    const totalCustom = Object.values(customAmounts).reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
    if (Math.abs(totalCustom - total) > 0.01) {
      alert(`Total must equal $${total.toFixed(2)}. Current total: $${totalCustom.toFixed(2)}`);
      return;
    }

    const split = {
      yourShare: (total - totalCustom).toFixed(2),
      splits: selectedMembers.map(member => ({
        member,
        amount: customAmounts[member] || '0.00'
      }))
    };
    onSplit(split);
    setShowSplitUI(false);
  };

  const totalSplit = Object.values(customAmounts).reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
  const yourShare = (total - totalSplit).toFixed(2);

  return (
    <div className="split-payment-container">
      <button 
        className="btn-split-toggle"
        onClick={() => setShowSplitUI(!showSplitUI)}
      >
        <Users size={18} /> Split with Friends
      </button>

      {showSplitUI && (
        <div className="split-payment-modal glass-panel">
          <div className="split-header">
            <h3>Split Payment</h3>
            <button className="close-btn" onClick={() => setShowSplitUI(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="split-content">
            <div className="total-display">
              <span className="label">Total Bill</span>
              <span className="amount">${total.toFixed(2)}</span>
            </div>

            <div className="split-section">
              <h4>Select Friends</h4>
              <div className="friends-list">
                {members.length === 0 ? (
                  <p className="no-friends">No friends available to split with</p>
                ) : (
                  members.map(member => (
                    <div key={member} className="friend-option">
                      <label className="friend-checkbox">
                        <input 
                          type="checkbox" 
                          checked={selectedMembers.includes(member)}
                          onChange={(e) => e.target.checked ? handleAddMember(member) : handleRemoveMember(member)}
                        />
                        <span>{member}</span>
                      </label>
                      {selectedMembers.includes(member) && (
                        <button 
                          className="remove-btn"
                          onClick={() => handleRemoveMember(member)}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {selectedMembers.length > 0 && (
              <div className="split-amounts">
                <h4>Amount per person</h4>
                
                <div className="amount-item your-share">
                  <span className="name">Your Share</span>
                  <span className="amount">${yourShare}</span>
                </div>

                {selectedMembers.map(member => (
                  <div key={member} className="amount-item">
                    <label>{member}</label>
                    <div className="amount-input-group">
                      <span>$</span>
                      <input 
                        type="number" 
                        min="0" 
                        step="0.01"
                        value={customAmounts[member] || '0.00'}
                        onChange={(e) => handleAmountChange(member, e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                ))}

                <div className="split-validation">
                  <span className={`status ${Math.abs(totalSplit - total) < 0.01 ? 'valid' : 'invalid'}`}>
                    Total: ${(parseFloat(yourShare) + totalSplit).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="split-actions">
              <button 
                className="btn-secondary"
                onClick={handleEqualSplit}
                disabled={selectedMembers.length === 0}
              >
                <DollarSign size={16} /> Equal Split
              </button>
              <button 
                className="btn-primary"
                onClick={handleCustomSplit}
                disabled={selectedMembers.length === 0}
              >
                <DollarSign size={16} /> Split Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
