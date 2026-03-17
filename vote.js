(function () {
  // Simulated vote counts - shared across all users
  const VOTE_STATE = {
    startTime: Date.now(),
    baseYes: 385001,
    baseNo: 119039,
    userVotes: { yes: 0, no: 0 },
    hasVoted: false,
    userChoice: null
  };

  // Calculate current simulated votes based on time elapsed
  function getSimulatedVotes() {
    const elapsed = (Date.now() - VOTE_STATE.startTime) / 1000; // seconds
    
    // Organic growth rates (votes per second)
    const yesGrowthRate = 2.3; // ~138 votes per minute
    const noGrowthRate = 0.8;  // ~48 votes per minute
    
    // Add some randomness for organic feel
    const yesVariation = Math.sin(elapsed / 10) * 15;
    const noVariation = Math.cos(elapsed / 7) * 8;
    
    const simulatedYes = Math.floor(VOTE_STATE.baseYes + (elapsed * yesGrowthRate) + yesVariation);
    const simulatedNo = Math.floor(VOTE_STATE.baseNo + (elapsed * noGrowthRate) + noVariation);
    
    return {
      yes: simulatedYes + VOTE_STATE.userVotes.yes,
      no: simulatedNo + VOTE_STATE.userVotes.no
    };
  }

  let selectedVote = null;

  function buildModal() {
    const overlay = document.createElement("div");
    overlay.id = "vote-overlay";
    overlay.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 999999;
      display: flex; align-items: center; justify-content: center; padding: 20px;
      backdrop-filter: blur(5px); animation: fadeIn 0.3s ease;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
      @keyframes countUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      
      .vote-option {
        background: #fff; border: 3px solid #e0e0e0; border-radius: 16px; padding: 32px;
        cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex; flex-direction: column; align-items: center; gap: 16px;
        position: relative; overflow: hidden; min-width: 280px;
      }
      .vote-option:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.12); border-color: #bdbdbd; }
      .vote-option.selected { border-color: #4caf50; background: #f1f8e9; box-shadow: 0 8px 20px rgba(76, 175, 80, 0.3); }
      .vote-option.selected::before {
        content: "✓"; position: absolute; top: 16px; right: 16px; background: #4caf50;
        color: white; width: 32px; height: 32px; border-radius: 50%; display: flex;
        align-items: center; justify-content: center; font-weight: bold; font-size: 18px;
      }
      
      .vote-icon { font-size: 4em; animation: pulse 2s ease infinite; }
      .vote-label { font-size: 2em; font-weight: bold; color: #202122; text-transform: uppercase; letter-spacing: 1px; }
      .vote-count { font-size: 2.5em; font-weight: 800; color: #4caf50; font-family: 'Courier New', monospace; }
      .vote-percentage { font-size: 1.2em; color: #72777d; font-weight: 600; }
      
      .progress-bar {
        width: 100%; height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden;
        margin-top: 8px;
      }
      .progress-fill {
        height: 100%; background: linear-gradient(90deg, #4caf50, #66bb6a);
        transition: width 0.5s ease;
      }
    `;
    document.head.appendChild(style);

    const box = document.createElement("div");
    box.style.cssText = `
      background: #f8f9fa; border-radius: 20px; max-width: 800px; width: 100%;
      display: flex; flex-direction: column; box-shadow: 0 24px 80px rgba(0,0,0,0.5);
      animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1); position: relative; overflow: hidden;
    `;

    const votes = getSimulatedVotes();
    const total = votes.yes + votes.no;
    const yesPercent = ((votes.yes / total) * 100).toFixed(1);
    const noPercent = ((votes.no / total) * 100).toFixed(1);

    box.innerHTML = `
      <div style="background: linear-gradient(135deg, #1b5e20, #4caf50); padding: 32px; position: relative; flex-shrink: 0;">
        <div style="position: absolute; right: 0; top: 0; bottom: 0; opacity: 0.1; font-size: 120px; line-height: 1; pointer-events: none; overflow: hidden;">☘️</div>
        <button id="vote-close" style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.2); border: none; color: white; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; transition: background 0.2s;">✕</button>
        
        <div style="display: flex; align-items: center; gap: 20px; position: relative; z-index: 1;">
          <div style="background: white; padding: 12px; border-radius: 16px; box-shadow: 0 8px 16px rgba(0,0,0,0.2);">
            <div style="font-size: 3em; line-height: 1;">🗳️</div>
          </div>
          <div>
            <h1 style="margin: 0 0 8px 0; color: white; font-size: 2.2em; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">Community Skin Vote</h1>
            <p style="margin: 0; color: #e8f5e9; font-size: 1.1em; opacity: 0.9;">Should St. Patrick's Day skins become official Minecraft skins?</p>
          </div>
        </div>
      </div>

      <div style="padding: 48px 32px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="font-size: 1.1em; color: #72777d; margin-bottom: 8px;">Total Votes</div>
          <div id="total-votes" style="font-size: 2.5em; font-weight: 800; color: #202122; font-family: 'Courier New', monospace;">${total.toLocaleString()}</div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px;">
          <div class="vote-option" data-vote="yes">
            <div class="vote-icon">👍</div>
            <div class="vote-label" style="color: #2e7d32;">YES</div>
            <div id="yes-count" class="vote-count" style="color: #2e7d32;">${votes.yes.toLocaleString()}</div>
            <div id="yes-percent" class="vote-percentage">${yesPercent}%</div>
            <div class="progress-bar">
              <div id="yes-progress" class="progress-fill" style="width: ${yesPercent}%; background: linear-gradient(90deg, #2e7d32, #4caf50);"></div>
            </div>
          </div>

          <div class="vote-option" data-vote="no">
            <div class="vote-icon">👎</div>
            <div class="vote-label" style="color: #c62828;">NO</div>
            <div id="no-count" class="vote-count" style="color: #c62828;">${votes.no.toLocaleString()}</div>
            <div id="no-percent" class="vote-percentage">${noPercent}%</div>
            <div class="progress-bar">
              <div id="no-progress" class="progress-fill" style="width: ${noPercent}%; background: linear-gradient(90deg, #c62828, #e57373);"></div>
            </div>
          </div>
        </div>

        <div style="text-align: center; color: #72777d; font-size: 0.95em; margin-bottom: 24px;">
          <strong style="color: #d32f2f;">Closes March 23</strong> · 1 vote per account · Live results
        </div>

        <button id="vote-submit" style="
          width: 100%; background: #4caf50; color: white; border: none; padding: 18px; font-size: 1.2em;
          font-weight: bold; border-radius: 12px; cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3); text-transform: uppercase; letter-spacing: 1px;
        " disabled>
          Select Your Vote
        </button>
      </div>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // Update votes in real-time
    const updateInterval = setInterval(() => {
      const currentVotes = getSimulatedVotes();
      const currentTotal = currentVotes.yes + currentVotes.no;
      const currentYesPercent = ((currentVotes.yes / currentTotal) * 100).toFixed(1);
      const currentNoPercent = ((currentVotes.no / currentTotal) * 100).toFixed(1);

      document.getElementById('total-votes').textContent = currentTotal.toLocaleString();
      document.getElementById('yes-count').textContent = currentVotes.yes.toLocaleString();
      document.getElementById('no-count').textContent = currentVotes.no.toLocaleString();
      document.getElementById('yes-percent').textContent = currentYesPercent + '%';
      document.getElementById('no-percent').textContent = currentNoPercent + '%';
      document.getElementById('yes-progress').style.width = currentYesPercent + '%';
      document.getElementById('no-progress').style.width = currentNoPercent + '%';
    }, 1000);

    // Events
    document.getElementById("vote-close").onclick = () => {
      clearInterval(updateInterval);
      overlay.remove();
    };
    document.getElementById("vote-close").onmouseover = function() { this.style.background = 'rgba(255,255,255,0.3)'; };
    document.getElementById("vote-close").onmouseout = function() { this.style.background = 'rgba(255,255,255,0.2)'; };
    
    overlay.onclick = (e) => { 
      if (e.target === overlay) {
        clearInterval(updateInterval);
        overlay.remove();
      }
    };

    const submitBtn = document.getElementById("vote-submit");
    
    // Selection logic
    box.querySelectorAll(".vote-option").forEach(option => {
      option.addEventListener("click", () => {
        const vote = option.dataset.vote;
        selectedVote = vote;
        
        box.querySelectorAll(".vote-option").forEach(o => o.classList.remove("selected"));
        option.classList.add("selected");
        
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.textContent = `Submit Vote: ${vote.toUpperCase()} 🍀`;
        submitBtn.style.background = vote === 'yes' ? '#2e7d32' : '#c62828';
      });
    });

    submitBtn.onclick = () => handleSubmit(updateInterval);
  }

  function handleSubmit(updateInterval) {
    if (!selectedVote) {
      return;
    }

    if (VOTE_STATE.hasVoted) {
      alert("You have already voted!");
      return;
    }

    // Add user's vote to the count
    VOTE_STATE.userVotes[selectedVote]++;
    VOTE_STATE.hasVoted = true;
    VOTE_STATE.userChoice = selectedVote;

    clearInterval(updateInterval);

    // Get final vote counts
    const finalVotes = getSimulatedVotes();
    const finalTotal = finalVotes.yes + finalVotes.no;
    const finalYesPercent = ((finalVotes.yes / finalTotal) * 100).toFixed(1);
    const finalNoPercent = ((finalVotes.no / finalTotal) * 100).toFixed(1);

    // Success Screen
    const overlay = document.getElementById("vote-overlay");
    const box = overlay.querySelector("div");
    
    box.innerHTML = `
      <div style="background: linear-gradient(135deg, #1b5e20, #4caf50); padding: 20px 24px; position: relative; flex-shrink: 0;">
        <div style="position: absolute; right: 0; top: 0; bottom: 0; opacity: 0.1; font-size: 80px; line-height: 1; pointer-events: none; overflow: hidden;">☘️</div>
        <button id="vote-close-success" style="position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; transition: background 0.2s; z-index: 10;">✕</button>
        
        <div style="display: flex; align-items: center; gap: 14px; position: relative; z-index: 1; max-width: calc(100% - 60px);">
          <div style="background: white; padding: 8px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); flex-shrink: 0;">
            <div style="font-size: 2em; line-height: 1;">🎉</div>
          </div>
          <div style="flex: 1; min-width: 0;">
            <h1 style="margin: 0 0 4px 0; color: white; font-size: 1.5em; text-shadow: 0 2px 4px rgba(0,0,0,0.2); word-wrap: break-word;">Thanks for Voting!</h1>
            <p style="margin: 0; color: #e8f5e9; font-size: 0.9em; opacity: 0.9; word-wrap: break-word;">Your vote has been recorded. Thank you for participating!</p>
          </div>
        </div>
      </div>

      <div style="padding: 24px 20px; text-align: center;">
        <div style="font-size: 3em; margin-bottom: 12px; animation: pulse 1s ease infinite;">${selectedVote === 'yes' ? '👍' : '👎'}</div>
        <h2 style="color: ${selectedVote === 'yes' ? '#2e7d32' : '#c62828'}; font-size: 1.8em; margin: 0 0 8px;">You Voted: ${selectedVote.toUpperCase()}</h2>
        <p style="color: #54595d; font-size: 1em; margin: 0 0 20px;">Your vote has been counted!</p>
        
        <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 6px 20px rgba(0,0,0,0.05); max-width: 500px; margin: 0 auto; border: 2px solid #e8f5e9;">
          <h3 style="margin: 0 0 14px; color: #202122; border-bottom: 2px solid #f8f9fa; padding-bottom: 8px; font-size: 1.1em;">Current Results</h3>
          
          <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-weight: 600; color: #2e7d32; font-size: 0.9em;">👍 YES</span>
              <span style="font-weight: 700; color: #2e7d32; font-size: 1em;">${finalVotes.yes.toLocaleString()} (${finalYesPercent}%)</span>
            </div>
            <div style="width: 100%; height: 10px; background: #e0e0e0; border-radius: 5px; overflow: hidden;">
              <div style="height: 100%; background: linear-gradient(90deg, #2e7d32, #4caf50); width: ${finalYesPercent}%;"></div>
            </div>
          </div>

          <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-weight: 600; color: #c62828; font-size: 0.9em;">👎 NO</span>
              <span style="font-weight: 700; color: #c62828; font-size: 1em;">${finalVotes.no.toLocaleString()} (${finalNoPercent}%)</span>
            </div>
            <div style="width: 100%; height: 10px; background: #e0e0e0; border-radius: 5px; overflow: hidden;">
              <div style="height: 100%; background: linear-gradient(90deg, #c62828, #e57373); width: ${finalNoPercent}%;"></div>
            </div>
          </div>

          <div style="text-align: center; padding-top: 12px; border-top: 1px dashed #e0e0e0;">
            <div style="color: #72777d; font-size: 0.85em;">Total Votes</div>
            <div style="font-size: 1.6em; font-weight: 800; color: #202122; font-family: 'Courier New', monospace;">${finalTotal.toLocaleString()}</div>
          </div>
        </div>
        
        <div style="margin-top: 20px; display: flex; flex-direction: column; align-items: center; gap: 12px;">
          <div style="background: #fff3cd; color: #856404; padding: 8px 18px; border-radius: 20px; font-weight: 500; font-size: 0.9em;">
            🏆 Winners announced March 23, 2026
          </div>
          <button onclick="document.getElementById('vote-overlay').remove()" style="background: transparent; color: #54595d; border: none; text-decoration: underline; cursor: pointer; font-size: 0.9em;">Return to Wiki</button>
        </div>
      </div>
    `;

    document.getElementById("vote-close-success").onclick = () => overlay.remove();
    document.getElementById("vote-close-success").onmouseover = function() { this.style.background = 'rgba(255,255,255,0.3)'; };
    document.getElementById("vote-close-success").onmouseout = function() { this.style.background = 'rgba(255,255,255,0.2)'; };
  }

  function attachToButtons() {
    document.querySelectorAll("button, a").forEach(el => {
      if (el.textContent.includes("Vote Now") || el.textContent.includes("VOTE NOW")) {
        el.onclick = (e) => { 
          // Only prevent default if it's not linking somewhere else essential
          e.preventDefault(); 
          buildModal(); 
        };
      }
    });
  }

  // Handle both dynamic and static loading
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attachToButtons);
  } else {
    attachToButtons();
  }

  window.openVoteModal = buildModal;
})();