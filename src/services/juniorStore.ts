import { dataStore } from './dataStore'

export interface WishlistItem {
  id: string
  itemName: string
  targetPrice: number
  saved: number
  emoji: string
  color?: string
}

export interface Quest {
  id: string | number
  title: string
  desc: string
  reward: number
  xp: number
  emoji: string
  status: 'pending' | 'awaiting' | 'approved'
  daysLeft?: number
  streak?: number
}

export interface Badge {
  id: string | number
  emoji: string
  title: string
  desc: string
  earned: boolean
  date?: string
  rarity: string
  hint?: string
}

export interface ActivityItem {
  id: string
  emoji: string
  label: string
  amount: number
  time: string
  type: 'income' | 'spend' | 'reward' | 'transfer'
}

export interface JuniorData {
  hasCompletedSetup: boolean
  profile: {
    childName: string
    childAge: number
    allowanceAmount: number
    allowanceFrequency: 'Weekly' | 'Monthly' | 'Custom'
    parentPin: string
    xp: number
  }
  balances: {
    spend: number
    save: number
    give: number
  }
  jarAllocation: {
    spendPct: number
    savePct: number
    givePct: number
  }
  streaks: {
    savingStreak: number
    questStreak: number
    budgetWins: number
    giveStreak: number
  }
  wishlist: WishlistItem[]
  quests: Quest[]
  badges: Badge[]
  activity: ActivityItem[]
}

export type JuniorProfileData = JuniorData

class JuniorStoreManager {
  private listeners: Set<() => void> = new Set()

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    this.listeners.forEach(fn => {
      try {
        fn()
      } catch (e) {
        console.error('JuniorStore listener error', e)
      }
    })
  }

  private getStorageKey(): string {
    const parentEmail = dataStore.getActiveEmail() || 'default'
    return `moneymate_junior_${parentEmail}`
  }

  public getData(): JuniorData {
    const key = this.getStorageKey()
    const raw = localStorage.getItem(key)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        const name = parsed.profile?.childName || parsed.childName || ''
        const isSetupCompleted = Boolean(parsed.hasCompletedSetup) && Boolean(name) && name !== 'Junior Saver'
        return {
          hasCompletedSetup: isSetupCompleted,
          profile: {
            childName: name,
            childAge: Number(parsed.profile?.childAge || parsed.childAge || 10),
            allowanceAmount: Number(parsed.profile?.allowanceAmount || parsed.allowanceAmount || 1000),
            allowanceFrequency: parsed.profile?.allowanceFrequency || parsed.allowanceFrequency || 'Monthly',
            parentPin: parsed.profile?.parentPin || parsed.parentPin || '1234',
            xp: Number(parsed.profile?.xp ?? parsed.xp ?? 0),
          },
          balances: {
            spend: Number(parsed.balances?.spend ?? parsed.spendBalance ?? 500),
            save: Number(parsed.balances?.save ?? parsed.saveBalance ?? 350),
            give: Number(parsed.balances?.give ?? parsed.giveBalance ?? 150),
          },
          jarAllocation: {
            spendPct: Number(parsed.jarAllocation?.spendPct ?? 50),
            savePct: Number(parsed.jarAllocation?.savePct ?? 35),
            givePct: Number(parsed.jarAllocation?.givePct ?? 15),
          },
          streaks: {
            savingStreak: Number(parsed.streaks?.savingStreak ?? 0),
            questStreak: Number(parsed.streaks?.questStreak ?? 0),
            budgetWins: Number(parsed.streaks?.budgetWins ?? 0),
            giveStreak: Number(parsed.streaks?.giveStreak ?? 0),
          },
          wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist.map((w: any) => ({
            id: String(w.id || Date.now()),
            itemName: w.itemName || w.name || 'Wish Goal',
            targetPrice: Number(w.targetPrice || w.target || 1000),
            saved: Number(w.saved || w.savedAmount || 0),
            emoji: w.emoji || '🎯',
            color: w.color || '#0EA5E9',
          })) : [],
          quests: Array.isArray(parsed.quests) ? parsed.quests.map((q: any) => ({
            id: q.id || Date.now(),
            title: q.title || 'Task',
            desc: q.desc || q.description || '',
            reward: Number(q.reward || 50),
            xp: Number(q.xp || q.xpReward || 20),
            emoji: q.emoji || '📋',
            status: q.status === 'completed' || q.status === 'approved' ? 'approved' : q.status === 'pending_approval' || q.status === 'awaiting' ? 'awaiting' : 'pending',
            daysLeft: q.daysLeft,
            streak: q.streak,
          })) : [],
          badges: Array.isArray(parsed.badges) ? parsed.badges.map((b: any) => ({
            id: b.id || Date.now(),
            emoji: b.emoji || '🏅',
            title: b.title || 'Badge',
            desc: b.desc || '',
            earned: Boolean(b.earned || b.earnedDate),
            date: b.date || b.earnedDate,
            rarity: b.rarity || 'Uncommon',
            hint: b.hint,
          })) : [],
          activity: Array.isArray(parsed.activity) ? parsed.activity.map((a: any) => ({
            id: String(a.id || Date.now()),
            emoji: a.emoji || '📜',
            label: a.label || 'Activity',
            amount: Number(a.amount || 0),
            time: a.time || a.date || 'Just now',
            type: a.type || 'income',
          })) : [],
        }
      } catch (e) {
        console.warn('Junior data parse error', e)
      }
    }

    // Default Initial Seed Data if never set up
    return {
      hasCompletedSetup: false,
      profile: {
        childName: '',
        childAge: 10,
        allowanceAmount: 1000,
        allowanceFrequency: 'Monthly',
        parentPin: '1234',
        xp: 0,
      },
      balances: {
        spend: 500,
        save: 350,
        give: 150,
      },
      jarAllocation: {
        spendPct: 50,
        savePct: 35,
        givePct: 15,
      },
      streaks: {
        savingStreak: 0,
        questStreak: 0,
        budgetWins: 0,
        giveStreak: 0,
      },
      wishlist: [
        { id: '1', itemName: 'New Bicycle', emoji: '🚲', targetPrice: 5000, saved: 1500, color: '#0EA5E9' },
        { id: '2', itemName: 'Gaming Headset', emoji: '🎧', targetPrice: 2500, saved: 800, color: '#8B5CF6' },
      ],
      quests: [
        { id: 1, title: 'Clean Bedroom', desc: 'Tidy up your room and make your bed', reward: 50, xp: 20, emoji: '🛏️', status: 'pending', daysLeft: 1 },
        { id: 2, title: 'Finish Homework', desc: 'Complete all practice problems', reward: 80, xp: 35, emoji: '📐', status: 'pending', daysLeft: 2 },
        { id: 3, title: 'Read for 30 Minutes', desc: 'Read any book of your choice', reward: 40, xp: 15, emoji: '📖', status: 'pending' },
      ],
      badges: [
        { id: 1, emoji: '🔥', title: 'First Savings Goal', desc: 'Started your first savings goal', earned: true, date: 'Today', rarity: 'Common' },
        { id: 2, emoji: '🏆', title: 'Budget Explorer', desc: 'Configured your monthly kids budget', earned: true, date: 'Today', rarity: 'Epic' },
        { id: 3, emoji: '💰', title: 'First ₹100 Saved', desc: 'Locked your first ₹100 into the savings vault', earned: false, rarity: 'Common', hint: 'Save ₹100 into goal' },
      ],
      activity: [],
    }
  }

  public saveData(data: JuniorData) {
    const key = this.getStorageKey()
    localStorage.setItem(key, JSON.stringify(data))
    this.notify()
  }

  public setupProfile(setup: {
    childName: string
    childAge: number
    allowanceAmount: number
    allowanceFrequency: 'Weekly' | 'Monthly' | 'Custom'
    parentPin: string
    spendStart: number
    saveStart: number
    giveStart: number
    spendPct: number
    savePct: number
    givePct: number
  }) {
    const current = this.getData()
    current.hasCompletedSetup = true
    current.profile.childName = setup.childName
    current.profile.childAge = setup.childAge
    current.profile.allowanceAmount = setup.allowanceAmount
    current.profile.allowanceFrequency = setup.allowanceFrequency
    current.profile.parentPin = setup.parentPin || '1234'

    current.balances.spend = setup.spendStart
    current.balances.save = setup.saveStart
    current.balances.give = setup.giveStart

    current.jarAllocation = {
      spendPct: setup.spendPct,
      savePct: setup.savePct,
      givePct: setup.givePct,
    }

    current.activity.unshift({
      id: `act_${Date.now()}`,
      emoji: '🎉',
      label: 'Welcome to MoneyMate Junior!',
      amount: setup.spendStart + setup.saveStart + setup.giveStart,
      time: 'Just now',
      type: 'income',
    })

    this.saveData(current)
  }

  public updateJarAllocations(spendPct: number, savePct: number, givePct: number) {
    const data = this.getData()
    data.jarAllocation = { spendPct, savePct, givePct }
    this.saveData(data)
  }

  public depositAllowance(amount: number) {
    const data = this.getData()
    const allowance = amount || data.profile.allowanceAmount
    if (allowance <= 0) return

    const spendAdd = Math.round((data.jarAllocation.spendPct / 100) * allowance)
    const saveAdd = Math.round((data.jarAllocation.savePct / 100) * allowance)
    const giveAdd = Math.max(0, allowance - spendAdd - saveAdd)

    data.balances.spend += spendAdd
    data.balances.save += saveAdd
    data.balances.give += giveAdd

    data.activity.unshift({
      id: `act_${Date.now()}`,
      emoji: '💰',
      label: `Allowance Credited (₹${allowance})`,
      amount: allowance,
      time: 'Just now',
      type: 'income',
    })

    this.saveData(data)
  }

  public markQuestComplete(questId: string | number) {
    const data = this.getData()
    const idx = data.quests.findIndex(q => String(q.id) === String(questId))
    if (idx !== -1) {
      data.quests[idx].status = 'awaiting'
      this.saveData(data)
    }
  }

  public approveQuest(questId: string | number) {
    const data = this.getData()
    const idx = data.quests.findIndex(q => String(q.id) === String(questId))
    if (idx !== -1) {
      const q = data.quests[idx]
      q.status = 'approved'
      data.balances.spend += q.reward
      data.profile.xp += q.xp

      data.activity.unshift({
        id: `act_${Date.now()}`,
        emoji: '✅',
        label: `Quest Approved: ${q.title}`,
        amount: q.reward,
        time: 'Just now',
        type: 'reward',
      })

      this.saveData(data)
    }
  }

  public addQuest(newQuest: {
    title: string
    desc: string
    reward: number
    xp: number
    emoji: string
    daysLeft: number
  }) {
    const data = this.getData()
    data.quests.unshift({
      id: Date.now(),
      title: newQuest.title,
      desc: newQuest.desc,
      reward: newQuest.reward,
      xp: newQuest.xp,
      emoji: newQuest.emoji,
      status: 'pending',
      daysLeft: newQuest.daysLeft,
    })
    this.saveData(data)
  }

  public addWishlistItem(itemName: string, targetPrice: number, emoji: string) {
    const data = this.getData()
    data.wishlist.unshift({
      id: String(Date.now()),
      itemName,
      targetPrice,
      saved: 0,
      emoji: emoji || '🎯',
      color: '#0EA5E9',
    })
    this.saveData(data)
  }

  public saveTowardsGoal(goalId: string, amount: number) {
    const data = this.getData()
    const idx = data.wishlist.findIndex(w => String(w.id) === String(goalId))
    if (idx !== -1 && amount > 0 && data.balances.spend >= amount) {
      data.balances.spend -= amount
      data.balances.save += amount
      data.wishlist[idx].saved += amount

      data.activity.unshift({
        id: `act_${Date.now()}`,
        emoji: data.wishlist[idx].emoji || '🎯',
        label: `Saved for ${data.wishlist[idx].itemName}`,
        amount: -amount,
        time: 'Just now',
        type: 'transfer',
      })

      this.saveData(data)
    }
  }

  public recordPurchase(description: string, amount: number) {
    const data = this.getData()
    if (amount <= 0 || data.balances.spend < amount) return false

    data.balances.spend -= amount
    data.activity.unshift({
      id: `act_${Date.now()}`,
      emoji: '🛍️',
      label: description,
      amount: -amount,
      time: 'Just now',
      type: 'spend',
    })

    this.saveData(data)
    return true
  }

  public verifyParentPin(pin: string): boolean {
    const data = this.getData()
    const correctPin = data.profile?.parentPin || '1234'
    return pin.trim() === correctPin.trim()
  }
}

export const juniorStore = new JuniorStoreManager()
export default juniorStore

