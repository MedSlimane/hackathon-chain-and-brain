export function AgricultureBackground() {
  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden">
      {/* Agricultural background image */}
      <div
        className="absolute inset-0 h-full w-full bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
      {/* Green accent overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 to-emerald-900/10" />
    </div>
  )
}

export default AgricultureBackground
