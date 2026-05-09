function hasActiveMembership(user) {
  if (!user?.membershipExpiresAt) {
    return false;
  }
  return new Date(user.membershipExpiresAt).getTime() > Date.now();
}

function canAutoExecute(user) {
  const referralOk = Boolean(user?.referredBy) || user?.role === "admin";
  const membershipOk = hasActiveMembership(user);
  return {
    eligible: referralOk && membershipOk,
    reason: referralOk
      ? membershipOk
        ? "레퍼럴 조건 및 멤버십 기간 조건 충족"
        : "멤버십 기간 만료 또는 미설정"
      : "레퍼럴 조건 미충족",
    referralOk,
    membershipOk
  };
}

module.exports = { canAutoExecute };
