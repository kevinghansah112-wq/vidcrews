import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true }
})

// Generate fake email from username (Supabase needs an email)
export const toEmail = (username) =>
  `${username.toLowerCase().trim().replace(/\s+/g, '_')}@vidcrews.com`

// ── AUTH ─────────────────────────────────────────────────
export async function signUp({ username, password, full_name, user_type, role, city, country, currency, recovery_email }) {
  const { data, error } = await supabase.auth.signUp({
    email: toEmail(username),
    password,
    options: {
      data: { username, full_name, user_type, role, city, country, currency }
    }
  })
  if (error) throw error

  if (data.user && recovery_email) {
    await supabase.from('profiles')
      .update({ recovery_email })
      .eq('id', data.user.id)
  }
  return data
}

export async function signIn({ username, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: toEmail(username),
    password,
  })
  if (error) throw error
  return data
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function resetPassword(recovery_email) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('recovery_email', recovery_email)
    .single()

  if (!profile?.username) throw new Error('No account found with that email')

  const { error } = await supabase.auth.resetPasswordForEmail(
    toEmail(profile.username),
    { redirectTo: `${window.location.origin}?reset=true` }
  )
  if (error) throw error
}

// ── PROFILE ───────────────────────────────────────────────
export async function getMyProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function uploadAvatar(userId, file) {
  const ext = file.name.split('.').pop()
  const path = `avatars/${userId}.${ext}`
  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}

export async function getCreativesNearCity(city, country) {
  let query = supabase
    .from('profiles')
    .select('*')
    .eq('status', 'active')
    .eq('user_type', 'creative')

  if (city) query = query.eq('city', city)
  else if (country) query = query.eq('country', country)

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

// ── EQUIPMENT ─────────────────────────────────────────────
export async function getEquipment(profileId) {
  const { data } = await supabase.from('equipment').select('name').eq('profile_id', profileId)
  return data?.map(e => e.name) || []
}

export async function setEquipment(profileId, names) {
  await supabase.from('equipment').delete().eq('profile_id', profileId)
  if (names.length > 0) {
    await supabase.from('equipment').insert(names.map(name => ({ profile_id: profileId, name })))
  }
}

// ── EARNINGS ──────────────────────────────────────────────
export async function getEarnings(profileId) {
  const { data } = await supabase.from('earnings').select('*').eq('profile_id', profileId).order('booking_date', { ascending: false })
  return data || []
}

export async function addEarning(profileId, entry) {
  const { data, error } = await supabase.from('earnings').insert({ profile_id: profileId, ...entry }).select().single()
  if (error) throw error
  return data
}

export async function deleteEarning(id) {
  await supabase.from('earnings').delete().eq('id', id)
}

// ── REVIEWS ───────────────────────────────────────────────
export async function getReviews(creativeId) {
  const { data } = await supabase
    .from('reviews')
    .select('*, reviewer:profiles!reviews_reviewer_id_fkey(username, initials, avatar_url)')
    .eq('creative_id', creativeId)
    .order('created_at', { ascending: false })
  return data || []
}

export async function addReview(creativeId, reviewerId, rating, comment) {
  const { error } = await supabase.from('reviews').insert({ creative_id: creativeId, reviewer_id: reviewerId, rating, comment })
  if (error) throw error
}

// ── REPORTS ───────────────────────────────────────────────
export async function reportUser(reporterId, reportedId, reason, details) {
  const { error } = await supabase.from('reports').insert({ reporter_id: reporterId, reported_id: reportedId, reason, details })
  if (error) throw error
}

// ── SHORTLIST ─────────────────────────────────────────────
export async function getShortlist(profileId) {
  const { data } = await supabase.from('shortlists').select('saved_id').eq('profile_id', profileId)
  return data?.map(s => s.saved_id) || []
}

export async function toggleShortlist(profileId, savedId, isSaved) {
  if (isSaved) {
    await supabase.from('shortlists').delete().eq('profile_id', profileId).eq('saved_id', savedId)
  } else {
    await supabase.from('shortlists').insert({ profile_id: profileId, saved_id: savedId })
  }
}

// ── MESSAGES ──────────────────────────────────────────────
export async function getMessages(userId) {
  const { data } = await supabase
    .from('messages')
    .select('*, sender:profiles!messages_sender_id_fkey(id,username,initials,avatar_url), receiver:profiles!messages_receiver_id_fkey(id,username,initials,avatar_url)')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false })
  return data || []
}

export async function sendMessage(senderId, receiverId, body) {
  const { data, error } = await supabase.from('messages').insert({ sender_id: senderId, receiver_id: receiverId, body }).select().single()
  if (error) throw error
  return data
}

// ── ADMIN ─────────────────────────────────────────────────
export async function getAllProfiles() {
  const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  return data || []
}

export async function updateProfileStatus(id, status) {
  await supabase.from('profiles').update({ status }).eq('id', id)
}

export async function getReports() {
  const { data } = await supabase
    .from('reports')
    .select('*, reporter:profiles!reports_reporter_id_fkey(username), reported:profiles!reports_reported_id_fkey(username, role)')
    .order('created_at', { ascending: false })
  return data || []
}
