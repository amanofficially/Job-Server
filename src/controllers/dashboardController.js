import Application from "../models/Application.js";

const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const applications = await Application.find({ userId });

    const total = applications.length;
    const applied = applications.filter((a) => a.status !== "Draft").length;
    const interviews = applications.filter((a) =>
      ["Interview", "Technical Round", "Final Round"].includes(a.status)
    ).length;
    const offers = applications.filter((a) => ["Offer", "Selected"].includes(a.status)).length;
    const rejected = applications.filter((a) => a.status === "Rejected").length;

    const successRate = total ? Math.round(((offers + interviews) / total) * 100) : 0;
    const interviewRate = total ? Math.round((interviews / total) * 100) : 0;

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisWeek = applications.filter((a) => new Date(a.applicationDate) >= startOfWeek).length;
    const thisMonth = applications.filter((a) => new Date(a.applicationDate) >= startOfMonth).length;

    const trend = [];
    for (let i = 13; i >= 0; i--) {
      const day = new Date();
      day.setDate(now.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      const count = applications.filter((a) => {
        const d = new Date(a.applicationDate);
        return d >= day && d < nextDay;
      }).length;

      trend.push({ date: day.toISOString().slice(5, 10), count });
    }

    const statusBreakdown = {};
    applications.forEach((a) => {
      statusBreakdown[a.status] = (statusBreakdown[a.status] || 0) + 1;
    });
    const statusChart = Object.entries(statusBreakdown).map(([status, count]) => ({ status, count }));

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const followUpsDueToday = applications.filter(
      (a) => a.followUpDate && new Date(a.followUpDate) <= today
    ).length;

    res.json({
      success: true,
      message: "",
      data: {
        total,
        applied,
        interviews,
        offers,
        rejected,
        successRate,
        interviewRate,
        thisWeek,
        thisMonth,
        followUpsDueToday,
        trend,
        statusChart,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { getStats };
