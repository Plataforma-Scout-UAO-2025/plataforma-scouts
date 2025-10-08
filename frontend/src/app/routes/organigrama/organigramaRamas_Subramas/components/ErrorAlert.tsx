
  const getBorderClass = () => {
    switch (type) {
      case 'error':
        return 'border-red-200';
      case 'warning':
        return 'border-yellow-200';
      case 'info':
        return 'border-blue-200';
    }
  };

  return (
    <Alert variant={getVariant()} className={`mb-4 ${getBorderClass()}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getIcon()}
          <AlertDescription className="text-sm">
            {message}
          </AlertDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0 hover:bg-transparent opacity-70 hover:opacity-100"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </Alert>
  );
}