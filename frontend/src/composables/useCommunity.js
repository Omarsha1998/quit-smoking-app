// composables/useCommunity.js
// Anonymous community challenge & encouragement wall logic.

import { ref } from 'vue'

function randomAlias() {
  const adj  = ['Brave', 'Strong', 'Calm', 'Bold', 'Free', 'Clear', 'Fresh', 'Wise', 'Pure', 'Cool']
  const noun = ['Fighter', 'Warrior', 'Walker', 'Climber', 'Dreamer', 'Runner', 'Seeker', 'Builder']
  return adj[Math.floor(Math.random() * adj.length)] +
    noun[Math.floor(Math.random() * noun.length)] +
    Math.floor(Math.random() * 99)
}

const DEFAULT_MESSAGES = [
  { alias: 'BraveWarrior42',  text: 'Day 5 here! Keep going everyone, it gets easier!' },
  { alias: 'FreshDreamer11',  text: 'The first week is the hardest. You can do this! 💪' },
  { alias: 'CalmFighter88',   text: 'I saved ₱500 this week. Feeling amazing!' },
  { alias: 'BoldSeeker27',    text: 'Whenever I crave, I use the breathing exercise. Works every time.' },
  { alias: 'FreeRunner55',    text: "Day 1 again after a slip, but I'm not giving up!" },
]

const DEFAULT_LEADERBOARD = [
  { alias: 'BraveWarrior42', days: 30 },
  { alias: 'CalmFighter88',  days: 22 },
  { alias: 'FreshDreamer11', days: 18 },
  { alias: 'BoldSeeker27',   days: 14 },
  { alias: 'FreeRunner55',   days: 7  },
]

export function useCommunity() {
  const joinedChallenge        = ref(false)
  const communityParticipants  = ref(247)
  const newMessage             = ref('')
  const myAlias                = ref('')
  const encouragementMessages  = ref([...DEFAULT_MESSAGES])
  const leaderboard            = ref([...DEFAULT_LEADERBOARD])

  function ensureAlias() {
    if (!myAlias.value) myAlias.value = randomAlias()
  }

  function joinChallenge(userDays) {
    ensureAlias()
    joinedChallenge.value = true
    communityParticipants.value++
    if (!leaderboard.value.find(e => e.alias === myAlias.value)) {
      leaderboard.value.push({ alias: myAlias.value, days: userDays })
      leaderboard.value.sort((a, b) => b.days - a.days)
    }
  }

  function postEncouragement() {
    const text = newMessage.value?.trim()
    if (!text || text.length < 3) return false
    ensureAlias()
    encouragementMessages.value.unshift({ alias: myAlias.value, text })
    if (encouragementMessages.value.length > 20) encouragementMessages.value.pop()
    newMessage.value = ''
    return true
  }

  return {
    joinedChallenge, communityParticipants,
    newMessage, myAlias,
    encouragementMessages, leaderboard,
    ensureAlias, joinChallenge, postEncouragement,
  }
}