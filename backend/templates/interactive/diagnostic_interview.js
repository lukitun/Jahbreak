/**
 * Interactive Template 4: Diagnostic Interview Approach
 * Problem identification and root cause discovery through systematic questioning
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}.

User Query: "${query}"

Conduct diagnostic interview to identify root causes, symptoms versus problems, contributing factors, and impact assessment. Ask probing questions to uncover the true nature of challenges and provide targeted solutions.

Start by asking about specific symptoms and manifestations of the issue.`;
}

module.exports = {
    name: "diagnostic_interview",
    description: "Problem identification through systematic questioning",
    bestFor: ["problem diagnosis", "root cause analysis", "troubleshooting", "issue identification"],
    generateTemplate
};