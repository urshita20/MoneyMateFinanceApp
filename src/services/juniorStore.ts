import { dataStore } from './dataStore'

export interface JuniorProfileData {
  hasCompletedSetup: boolean
  childName: string
  childAge: number
  allowanceAmount: number
  allowanceFrequency: 'weekly' | 'monthly'
  parentPin: string
  approvalThreshold: number

  spendBalance: number
  saveBalance: number
  giveBalance: number

  jarAllocation: {
    spendPct: number
    savePct: number
    givePct: number
  }

  xp: number
  streakDays: number
  lastActiveDate: string

  wishlist: Array<{
    id: string
    name: string
    targetPrice: number
    savedAmount: number
    emoji: string
    category: string
    createdAt: string
  }>

  quests: Array<{
    id: string
    title: string
    description: string
    reward: number
    xpReward: number
    status: 'available' | 'pending_approval' | 'completed'
    dueDate?: string
  }>

  badges: Array<{
    id: string
    title: string
    emoji: string
    desc: string
    earnedDate?: string
  }>

  activity: Array<{
    id: string
    emoji: string
    label: string
    amount: number
    date: string
    type: 'income' | 'spend' | 'reward' | 'transfer'
  }>
}

class JuniorStoreManager {
  private getStorageKey(): string {
    const parentEmail = dataStore.getActiveEmail() || 'default'
    return `moneymate_junior_${parentEmail}`
  }

  public getData(): JuniorProfileData {
    const key = this.getStorageKey()
    const raw = localStorage.getItem(key)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        return {
          ...parsed,
          wishlist: parsed.wishlist || [],
          quests: parsed.quests || [],
          badges: parsed.badges || [],
          activity: parsed.activity || [],
        }
      } catch (e) {
        console.warn('Junior data parse error', e)
      }
    }
    return {
      hasCompletedSetup: false,
      childName: '',
      childAge: 10,
      allowanceAmount: 500,
      allowanceFrequency: 'weekly',
      parentPin: '1234',
      approvalThreshold: 500,
      spendBalance: 0,
      saveBalance: 0,
      giveBalance: 0,
      jarAllocation: { spendPct: 50, savePct: 40, givePct: 10 },
      xp: 0,
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      wishlist: [],
      quests: [
        { id: 'q1', title: 'Clean Bedroom', description: 'Tidy up your bed and study desk', reward: 50, xpReward: 20, status: 'available' },
        { id: 'q2', title: 'Finish Homework', description: 'Complete school assignments', reward: 80, xpReward: 35, status: 'available' },
        { id: 'q3', title: 'Read for 30 Minutes', description: 'Read a book or educational chapter', reward: 40, xpReward: 15, status: 'available' },
      ],
      badges: [
        { id: 'b1', title: 'First Saver', emoji: '🌟', desc: 'Saved money toward a goal for the first time' },
        { id: 'b2', title: 'Chore Master', emoji: '🧹', desc: 'Completed 3 approved chores' },
        { id: 'b3', title: 'Goal Crusher', emoji: '🎯', desc: 'Reached 100% of a wishlist goal' },
        { id: 'b4', title: 'Smart Buyer', emoji: '🛡️', desc: 'Used the Buy Simulator before purchasing' },
      ],
      activity: [],
    }
  }

  public saveData(data: JuniorProfileData) {
    const key = this.getStorageKey()
    localStorage.setItem(key, JSON.stringify(data))
  }

  public setupJuniorProfile(setup: {
    childName: string
    childAge: number
    allowanceAmount: number
    allowanceFrequency: 'weekly' | 'monthly'
    parentPin: string
    initialSpend: number
    initialSave: number
    initialGive: number
    jarAllocation: { spendPct: number; savePct: number; givePct: number }
  }): JuniorProfileData {
    const current = this.getData()
    const updated: JuniorProfileData = {
      ...current,
      hasCompletedSetup: true,
      childName: setup.childName,
      childAge: setup.childAge,
      allowanceAmount: setup.allowanceAmount,
      allowanceFrequency: setup.allowanceFrequency,
      parentPin: setup.parentPin || '1234',
      spendBalance: setup.initialSpend,
      saveBalance: setup.initialSave,
      giveBalance: setup.initialGive,
      jarAllocation: setup.jarAllocation,
      activity: [
        {
          id: `act_${Date.now()}`,
          emoji: '🎉',
          label: 'Welcome to MoneyMate Junior!',
          amount: setup.initialSpend + setup.initialSave + setup.initialGive,
          date: 'Just now',
          type: 'income',
        },
      ],
    }
    this.saveData(updated)
    return updated
  }

  public updateJarAllocation(allocation: { spendPct: number; savePct: number; givePct: number }) {
    const data = this.getData()
    data.jarAllocation = allocation
    this.saveData(data)
  }

  public depositAllowance() {
    const data = this.getData()
    if (!data.hasCompletedSetup || data.allowanceAmount <= 0) return

    const allowance = data.allowanceAmount
    const spendAdd = Math.round((data.jarAllocation.spendPct / 100) * allowance)
    const saveAdd = Math.round((data.jarAllocation.savePct / 100) * allowance)
    const giveAdd = Math.max(0, allowance - spendAdd - saveAdd)

    data.spendBalance += spendAdd
    data.saveBalance += saveAdd
    data.giveBalance += giveAdd

    data.activity.unshift({
      id: `act_${Date.now()}`,
      emoji: '💰',
      label: 'Allowance Credited',
      amount: allowance,
      date: 'Today',
      type: 'income',
    })

    this.saveData(data)
  }

  public completeQuest(questId: string) {
    const data = this.getData()
    const idx = data.quests.findIndex(q => q.id === questId)
    if (idx !== -1) {
      data.quests[idx].status = 'pending_approval'
      this.saveData(data)
    }
  }

  public approveQuest(questId: string) {
    const data = this.getData()
    const idx = data.quests.findIndex(q => q.id === questId)
    if (idx !== -1) {
      const q = data.quests[idx]
      q.status = 'completed'

      // Reward credit
      data.spendBalance += q.reward
      data.xp += q.xpReward

      // Activity log
      data.activity.unshift({
        id: `act_${Date.now()}`,
        emoji: '✅',
        label: `Chore: ${q.title}`,
        amount: q.reward,
        date: 'Just now',
        type: 'reward',
      })

      // Check Chore Master badge (3 completed chores)
      const completedCount = data.quests.filter(item => item.status === 'completed').length
      if (completedCount >= 3) {
        const bIdx = data.badges.findIndex(b => b.id === 'b2')
        if (bIdx !== -1 && !data.badges[bIdx].earnedDate) {
          data.badges[bIdx].earnedDate = new Date().toISOString().split('T')[0]
        }
      }

      this.saveData(data)
    }
  }

  public createQuest(title: string, description: string, reward: number, xpReward: number) {
    const data = this.getData()
    const newQuest = {
      id: `q_${Date.now()}`,
      title,
      description,
      reward,
      xpReward,
      status: 'available' as const,
    }
    data.quests.push(newQuest)
    this.saveData(data)
  }

  public addWishlistItem(name: string, targetPrice: number, category: string, emoji: string) {
    const data = this.getData()
    const newItem = {
      id: `w_${Date.now()}`,
      name,
      targetPrice,
      savedAmount: 0,
      emoji: emoji || '🎁',
      category: category || 'Wishlist',
      createdAt: new Date().toISOString().split('T')[0],
    }
    data.wishlist.push(newItem)
    this.saveData(data)
  }

  public saveTowardWishlist(wishlistId: string, amount: number) {
    const data = this.getData()
    const idx = data.wishlist.findIndex(w => w.id === wishlistId)
    if (idx !== -1 && amount > 0 && data.spendBalance >= amount) {
      data.spendBalance -= amount
      data.saveBalance += amount
      data.wishlist[idx].savedAmount += amount

      // Activity log
      data.activity.unshift({
        id: `act_${Date.now()}`,
        emoji: data.wishlist[idx].emoji || '🎯',
        label: `Saved for ${data.wishlist[idx].name}`,
        amount: -amount,
        date: 'Just now',
        type: 'transfer',
      })

      // Check First Saver badge
      const bIdx = data.badges.findIndex(b => b.id === 'b1')
      if (bIdx !== -1 && !data.badges[bIdx].earnedDate) {
        data.badges[bIdx].earnedDate = new Date().toISOString().split('T')[0]
      }

      // Check Goal Crusher badge
      if (data.wishlist[idx].savedAmount >= data.wishlist[idx].targetPrice) {
        const gcIdx = data.badges.findIndex(b => b.id === 'b3')
        if (gcIdx !== -1 && !data.badges[gcIdx].earnedDate) {
          data.badges[gcIdx].earnedDate = new Date().toISOString().split('T')[0]
        }
      }

      this.saveData(data)
    }
  }

  public recordPurchase(description: string, amount: number, category: string = 'Shopping', emoji: string = '🛍️') {
    const data = this.getData()
    if (amount <= 0 || data.spendBalance < amount) return false

    data.spendBalance -= amount
    data.activity.unshift({
      id: `act_${Date.now()}`,
      emoji,
      label: description,
      amount: -amount,
      date: 'Just now',
      type: 'spend',
    })

    this.saveData(data)
    return true
  }

  public recordSmartBuyerBadge() {
    const data = this.getData()
    const bIdx = data.badges.findIndex(b => b.id === 'b4')
    if (bIdx !== -1 && !data.badges[bIdx].earnedDate) {
      data.badges[bIdx].earnedDate = new Date().toISOString().split('T')[0]
      this.saveData(data)
    }
  }

  public verifyParentPin(pin: string): boolean {
    const data = this.getData()
    const correctPin = data.parentPin || '1234'
    return pin.trim() === correctPin.trim()
  }
}

export const juniorStore = new JuniorStoreManager()
export default juniorStore

